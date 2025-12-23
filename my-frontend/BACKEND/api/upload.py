import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app, url_for
from werkzeug.utils import secure_filename

upload_bp = Blueprint('upload_bp', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/upload', methods=['POST', 'OPTIONS'])
def upload_file():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        current_app.logger.info(f'📤 Upload request received - Content-Type: {request.content_type}')
        current_app.logger.info(f'📤 Request files: {list(request.files.keys())}')
        current_app.logger.info(f'📤 Request headers: {dict(request.headers)}')
        
        if 'file' not in request.files:
            current_app.logger.error('Upload failed: No file part in request')
            current_app.logger.error(f'Available keys: {list(request.files.keys())}')
            return jsonify({'error': 'Không tìm thấy file trong request'}), 400
        
        file = request.files['file']
        current_app.logger.info(f'📤 File received: {file.filename if file else "None"}, size: {file.content_length if hasattr(file, "content_length") else "unknown"}')
        
        if not file or file.filename == '':
            current_app.logger.error('Upload failed: No file selected')
            return jsonify({'error': 'Vui lòng chọn file ảnh'}), 400
        
        if not allowed_file(file.filename):
            current_app.logger.error(f'Upload failed: Invalid file type - {file.filename}')
            return jsonify({'error': 'Định dạng file không được hỗ trợ. Chỉ chấp nhận: PNG, JPG, JPEG, GIF, WEBP'}), 400
        
        # Tạo tên file unique để tránh conflict
        original_filename = secure_filename(file.filename)
        file_ext = original_filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4().hex}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_ext}"
        
        # Tạo upload folder
        upload_folder = os.path.join(current_app.root_path, 'static', 'uploads')
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            current_app.logger.info(f'Created upload folder: {upload_folder}')
        
        file_path = os.path.join(upload_folder, unique_filename)
        
        # Lưu file
        file.save(file_path)
        current_app.logger.info(f'File saved to: {file_path}')
        
        # Tạo URL - luôn dùng backend URL vì static files được serve từ backend
        # Frontend sẽ load ảnh từ backend URL
        base_url = request.host_url.rstrip('/')
        file_url = f"{base_url}/static/uploads/{unique_filename}"
        
        # Log để debug
        origin = request.headers.get('Origin', 'N/A')
        current_app.logger.info(f'File uploaded successfully: {file_url} (origin: {origin}, backend: {base_url})')
        
        return jsonify({
            'message': 'Upload thành công',
            'url': file_url,
            'filename': unique_filename
        }), 200
    
    except Exception as e:
        current_app.logger.error(f'Upload error: {str(e)}', exc_info=True)
        return jsonify({'error': f'Lỗi khi upload: {str(e)}'}), 500
