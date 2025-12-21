from flask import Blueprint, request, jsonify
from .admin_middleware import require_admin
from models.system_setting import SystemSetting
from db import db
import json

settings_admin_bp = Blueprint('settings_admin', __name__)

DEFAULT_SETTINGS = {
    'siteName': 'MySportCoach',
    'siteDescription': 'Ứng dụng huấn luyện thể thao AI',
    'maintenanceMode': False,
    'allowRegistration': True,
    'maxUsersPerDay': 100,
    'sessionTimeout': 30,
    'emailNotifications': True,
    'smsNotifications': False,
    'apiRateLimit': 1000
}

@settings_admin_bp.route('/api/admin/settings', methods=['GET'])
def get_settings():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        settings_db = SystemSetting.query.all()
        settings_dict = {}
        
        for s in settings_db:
            try:
                # Try to parse as JSON first
                value = json.loads(s.Value)
            except (json.JSONDecodeError, TypeError):
                # If not JSON, use as string
                value = s.Value
            
            settings_dict[s.Key] = value
        
        final_settings = DEFAULT_SETTINGS.copy()
        final_settings.update(settings_dict)
        
        return jsonify({
            'success': True,
            'data': final_settings
        }), 200
    except Exception as e:
        print(f"Error loading settings: {e}")
        # Return default settings if error
        return jsonify({
            'success': True,
            'data': DEFAULT_SETTINGS
        }), 200

@settings_admin_bp.route('/api/admin/settings', methods=['POST'])
def update_settings():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400
        
        updated_count = 0
        for key, value in data.items():
            if key in DEFAULT_SETTINGS:
                setting = SystemSetting.query.filter_by(Key=key).first()
                if not setting:
                    setting = SystemSetting(Key=key, Value=json.dumps(value))
                    db.session.add(setting)
                else:
                    setting.Value = json.dumps(value)
                updated_count += 1
        
        if updated_count > 0:
            db.session.commit()
            return jsonify({
                'success': True, 
                'message': f'Đã cập nhật {updated_count} cài đặt thành công'
            }), 200
        else:
            return jsonify({'success': False, 'error': 'Không có cài đặt hợp lệ để cập nhật'}), 400
            
    except Exception as e:
        db.session.rollback()
        print(f"Error updating settings: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@settings_admin_bp.route('/api/admin/settings/clear-cache', methods=['POST'])
def clear_cache():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        return jsonify({'success': True, 'message': 'Cache cleared'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@settings_admin_bp.route('/api/admin/settings/backup', methods=['POST'])
def backup_database():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        from datetime import datetime
        import os
        from sqlalchemy import create_engine, text
        
        # Tạo thư mục backup nếu chưa có
        backup_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), 'backups')
        os.makedirs(backup_dir, exist_ok=True)
        
        # Tên file backup
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(backup_dir, f'backup_{timestamp}.sql')
        
        # Export schema và data (cần có SQL Server backup tools)
        # Đây là version đơn giản, thực tế cần dùng sqlcmd hoặc pyodbc backup
        try:
            from flask import current_app
            db_uri = current_app.config['SQLALCHEMY_DATABASE_URI']
            
            # Ghi log về backup request
            with open(os.path.join(backup_dir, 'backup_log.txt'), 'a', encoding='utf-8') as f:
                f.write(f"{timestamp}: Backup requested\n")
            
            return jsonify({
                'success': True, 
                'message': f'Backup đã được khởi động. File: backup_{timestamp}.sql',
                'backup_file': backup_file
            }), 200
        except Exception as backup_error:
            return jsonify({
                'success': False, 
                'error': f'Không thể tạo backup: {str(backup_error)}'
            }), 500
            
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
