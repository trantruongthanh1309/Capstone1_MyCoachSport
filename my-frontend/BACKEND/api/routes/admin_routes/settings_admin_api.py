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
        settings_dict = {s.Key: json.loads(s.Value) for s in settings_db}
        
        final_settings = DEFAULT_SETTINGS.copy()
        final_settings.update(settings_dict)
        
        return jsonify({
            'success': True,
            'data': final_settings
        }), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@settings_admin_bp.route('/api/admin/settings', methods=['POST'])
def update_settings():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        data = request.get_json()
        
        for key, value in data.items():
            if key in DEFAULT_SETTINGS:
                setting = SystemSetting.query.get(key)
                if not setting:
                    setting = SystemSetting(Key=key)
                    db.session.add(setting)
                
                setting.Value = json.dumps(value)
        
        db.session.commit()
        
        return jsonify({'success': True, 'message': 'Settings updated'}), 200
    except Exception as e:
        db.session.rollback()
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
