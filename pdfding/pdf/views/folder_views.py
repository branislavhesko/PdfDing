from django.contrib import messages
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views import View
from django_htmx.http import HttpResponseClientRefresh
from pdf.models import Folder, Pdf
from users.models import Profile


class CreateFolder(View):
    """Create a new folder."""

    def get(self, request: HttpRequest, **kwargs):
        """Display the form for creating a folder."""
        parent_id = request.GET.get('parent')
        parent_folder = None
        if parent_id:
            try:
                parent_folder = get_object_or_404(Folder, id=parent_id, owner=request.user.profile)
            except Folder.DoesNotExist:
                parent_folder = None
        
        context = {
            'parent_folder': parent_folder,
        }
        return render(request, 'folder/create_folder.html', context)

    def post(self, request: HttpRequest, **kwargs):
        """Handle POST request for creating a folder."""
        name = request.POST.get('name', '').strip()
        description = request.POST.get('description', '').strip()
        parent_id = request.POST.get('parent_id')
        
        if not name:
            messages.error(request, 'Folder name is required.')
            # Return form with error message
            context = {
                'error': 'Folder name is required.',
                'form_data': request.POST
            }
            return render(request, 'folder/create_folder.html', context)

        parent_folder = None
        if parent_id:
            try:
                parent_folder = Folder.objects.get(id=parent_id, owner=request.user.profile)
            except Folder.DoesNotExist:
                messages.error(request, 'Invalid parent folder.')
                context = {
                    'error': 'Invalid parent folder.',
                    'form_data': request.POST
                }
                return render(request, 'folder/create_folder.html', context)

        # Check for duplicate names in the same parent folder
        existing_folder = Folder.objects.filter(
            name=name, 
            owner=request.user.profile, 
            parent=parent_folder
        ).first()
        
        if existing_folder:
            messages.error(request, 'A folder with this name already exists in the same location.')
            context = {
                'error': 'A folder with this name already exists in the same location.',
                'form_data': request.POST,
                'parent_folder': parent_folder
            }
            return render(request, 'folder/create_folder.html', context)

        # Create the folder
        folder = Folder.objects.create(
            name=name,
            description=description or None,
            owner=request.user.profile,
            parent=parent_folder
        )
        
        messages.success(request, f'Folder "{folder.name}" created successfully.')
        
        # Return success message and close modal
        return render(request, 'folder/success.html', {
            'message': f'Folder "{folder.name}" created successfully!',
            'action': 'reload'  # This will trigger a page reload to show the new folder
        })


class DeleteFolder(View):
    """Delete a folder and optionally move its contents."""

    def get(self, request: HttpRequest, identifier: str, **kwargs):
        """Get the context for folder deletion confirmation."""
        folder = get_object_or_404(Folder, id=identifier, owner=request.user.profile)
        
        context = {
            'folder': folder,
            'pdf_count': folder.get_pdf_count(),
            'subfolder_count': folder.subfolders.count(),
        }
        return render(request, 'folder/delete_folder.html', context)

    def post(self, request: HttpRequest, identifier: str, **kwargs):
        """Handle folder deletion."""
        folder = get_object_or_404(Folder, id=identifier, owner=request.user.profile)
        action = request.POST.get('action')
        
        if action == 'move_to_parent':
            # Move all PDFs and subfolders to parent folder
            parent_folder = folder.parent
            folder.pdfs.update(folder=parent_folder)
            folder.subfolders.update(parent=parent_folder)
            folder_name = folder.name
            folder.delete()
            messages.success(request, f'Folder "{folder_name}" deleted and contents moved to parent folder.')
        
        elif action == 'move_to_root':
            # Move all PDFs and subfolders to root (no folder)
            folder.pdfs.update(folder=None)
            folder.subfolders.update(parent=None)
            folder_name = folder.name
            folder.delete()
            messages.success(request, f'Folder "{folder_name}" deleted and contents moved to root.')
        
        else:  # delete_all
            # Delete folder and all its contents recursively
            folder_name = folder.name
            self._delete_folder_recursive(folder)
            messages.success(request, f'Folder "{folder_name}" and all its contents deleted.')
        
        return HttpResponseClientRefresh()

    def _delete_folder_recursive(self, folder):
        """Recursively delete a folder and all its contents."""
        # Delete all PDFs in this folder
        folder.pdfs.all().delete()
        
        # Recursively delete all subfolders
        for subfolder in folder.subfolders.all():
            self._delete_folder_recursive(subfolder)
        
        # Delete the folder itself
        folder.delete()


class EditFolder(View):
    """Edit a folder's name and description."""

    def get(self, request: HttpRequest, identifier: str, **kwargs):
        """Get the context for folder editing."""
        folder = get_object_or_404(Folder, id=identifier, owner=request.user.profile)
        
        context = {
            'folder': folder,
        }
        return render(request, 'folder/edit_folder.html', context)

    def post(self, request: HttpRequest, identifier: str, **kwargs):
        """Handle folder editing."""
        folder = get_object_or_404(Folder, id=identifier, owner=request.user.profile)
        name = request.POST.get('name', '').strip()
        description = request.POST.get('description', '').strip()
        
        if not name:
            messages.error(request, 'Folder name is required.')
            return HttpResponseClientRefresh()

        # Check for duplicate names in the same parent folder (excluding current folder)
        existing_folder = Folder.objects.filter(
            name=name, 
            owner=request.user.profile, 
            parent=folder.parent
        ).exclude(id=folder.id).first()
        
        if existing_folder:
            messages.error(request, 'A folder with this name already exists in the same location.')
            return HttpResponseClientRefresh()

        folder.name = name
        folder.description = description or None
        folder.save()
        
        messages.success(request, f'Folder "{folder.name}" updated successfully.')
        return HttpResponseClientRefresh()


class MovePdfToFolder(View):
    """Move a PDF to a specific folder via AJAX."""

    def post(self, request: HttpRequest):
        """Handle PDF move operation."""
        pdf_id = request.POST.get('pdf_id')
        folder_id = request.POST.get('folder_id')
        
        if not pdf_id:
            return JsonResponse({'success': False, 'error': 'PDF ID is required'})
        
        try:
            pdf = Pdf.objects.get(id=pdf_id, owner=request.user.profile)
        except Pdf.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'PDF not found'})
        
        folder = None
        if folder_id and folder_id != 'root':
            try:
                folder = Folder.objects.get(id=folder_id, owner=request.user.profile)
            except Folder.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Folder not found'})
        
        pdf.folder = folder
        pdf.save()
        
        folder_name = folder.name if folder else 'Root'
        return JsonResponse({
            'success': True, 
            'message': f'PDF "{pdf.name}" moved to {folder_name}'
        })


class FolderTree(View):
    """Get folder tree structure for navigation."""

    def get(self, request: HttpRequest):
        """Return folder tree as JSON."""
        folders = Folder.objects.filter(owner=request.user.profile).select_related('parent')
        
        # Build tree structure
        folder_dict = {}
        root_folders = []
        
        for folder in folders:
            folder_data = {
                'id': str(folder.id),
                'name': folder.name,
                'description': folder.description,
                'pdf_count': folder.pdfs.count(),
                'children': []
            }
            folder_dict[str(folder.id)] = folder_data
            
            if folder.parent_id:
                parent_data = folder_dict.get(str(folder.parent_id))
                if parent_data:
                    parent_data['children'].append(folder_data)
            else:
                root_folders.append(folder_data)
        
        # Add root PDFs count
        root_pdf_count = Pdf.objects.filter(owner=request.user.profile, folder__isnull=True).count()
        
        return JsonResponse({
            'root_folders': root_folders,
            'root_pdf_count': root_pdf_count
        })