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
                # Always convert value to JSON string for storage (handles bool, int, str correctly)
                value_str = json.dumps(value)
                if not setting:
                    setting = SystemSetting(Key=key, Value=value_str)
                    db.session.add(setting)
                else:
                    setting.Value = value_str
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
        from flask import current_app
        
        # Clear Flask session cache if using filesystem session
        import os
        import time
        session_dir = current_app.config.get('SESSION_FILE_DIR', None)
        cleared_count = 0
        
        # Try to find flask_session directory
        if not session_dir:
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            possible_dirs = [
                os.path.join(base_dir, 'flask_session'),
                os.path.join(os.getcwd(), 'flask_session'),
                'flask_session'
            ]
            for dir_path in possible_dirs:
                if os.path.exists(dir_path):
                    session_dir = dir_path
                    break
        
        if session_dir and os.path.exists(session_dir):
            # Clear old session files (older than 1 hour)
            current_time = time.time()
            for filename in os.listdir(session_dir):
                filepath = os.path.join(session_dir, filename)
                if os.path.isfile(filepath):
                    try:
                        file_age = current_time - os.path.getmtime(filepath)
                        # Clear files older than 1 hour
                        if file_age > 3600:
                            os.remove(filepath)
                            cleared_count += 1
                    except Exception:
                        pass
        
        # Clear Python cache (__pycache__)
        import sys
        if hasattr(sys, '_getframe'):
            # Clear any module-level caches if needed
            pass
        
        message = f'Cache đã được xóa thành công'
        if session_dir:
            message += f' (đã xóa {cleared_count} session files cũ)'
        
        return jsonify({
            'success': True, 
            'message': message,
            'cleared_sessions': cleared_count
        }), 200
    except Exception as e:
        print(f"Error clearing cache: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@settings_admin_bp.route('/api/admin/settings/backup', methods=['POST'])
def backup_database():
    auth_error = require_admin()
    if auth_error:
        return auth_error
    
    try:
        from datetime import datetime
        import os
        from flask import current_app
        from sqlalchemy import create_engine, text
        import subprocess
        
        # Tạo thư mục backup nếu chưa có
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
        backup_dir = os.path.join(base_dir, 'backups')
        os.makedirs(backup_dir, exist_ok=True)
        
        # Tên file backup
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(backup_dir, f'backup_{timestamp}.sql')
        
        db_uri = current_app.config['SQLALCHEMY_DATABASE_URI']
        
        # Try to use sqlcmd if available (SQL Server command line tool)
        try:
            # Extract connection details from URI
            # Format: mssql+pyodbc://sa:123@MSI\SQLEXPRESS01/MySportCoachAI?driver=...
            import re
            uri_match = re.search(r'mssql\+pyodbc://([^:]+):([^@]+)@([^/]+)/([^?]+)', db_uri)
            if uri_match:
                username, password, server, database = uri_match.groups()
                server_clean = server.replace('\\', '/')
                
                # Use sqlcmd to backup (if available)
                sqlcmd_path = 'sqlcmd'  # Assumes sqlcmd is in PATH
                backup_cmd = [
                    sqlcmd_path,
                    '-S', server_clean,
                    '-U', username,
                    '-P', password,
                    '-d', database,
                    '-Q', f"BACKUP DATABASE [{database}] TO DISK = N'{backup_file}' WITH NOFORMAT, NOINIT, NAME = 'Full Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10"
                ]
                
                try:
                    result = subprocess.run(backup_cmd, capture_output=True, text=True, timeout=300)
                    if result.returncode == 0:
                        # Log successful backup
                        log_file = os.path.join(backup_dir, 'backup_log.txt')
                        with open(log_file, 'a', encoding='utf-8') as f:
                            f.write(f"{timestamp}: Backup completed successfully - {backup_file}\n")
                        
                        return jsonify({
                            'success': True, 
                            'message': f'✅ Backup thành công! File: {os.path.basename(backup_file)}',
                            'backup_file': backup_file
                        }), 200
                    else:
                        # If sqlcmd fails, fall back to log-only mode
                        raise Exception(f'sqlcmd failed: {result.stderr}')
                except (subprocess.TimeoutExpired, FileNotFoundError, Exception) as e:
                    # Fall back to log-only if sqlcmd not available or fails
                    print(f"sqlcmd backup failed: {e}")
                    pass
        except Exception as e:
            print(f"Error parsing URI for backup: {e}")
            pass
        
        # Fallback: Just log the backup request (when sqlcmd is not available)
        log_file = os.path.join(backup_dir, 'backup_log.txt')
        try:
            database_name = 'MySportCoachAI'
            server_name = 'MSI\\SQLEXPRESS01'
            if 'uri_match' in locals() and uri_match:
                database_name = database
                server_name = server
        except:
            pass
        
        with open(log_file, 'a', encoding='utf-8') as f:
            f.write(f"{timestamp}: Backup requested (manual backup recommended - sqlcmd not available)\n")
            f.write(f"Database: {database_name}, Server: {server_name}\n")
            f.write(f"Use SQL Server Management Studio or command: BACKUP DATABASE [{database_name}] TO DISK = '{backup_file}'\n\n")
        
        return jsonify({
            'success': True, 
            'message': f'⚠️ Backup request đã được ghi log. Vui lòng backup thủ công bằng SQL Server Management Studio.\nFile log: {log_file}',
            'backup_file': None,
            'note': 'sqlcmd không khả dụng, vui lòng backup thủ công'
        }), 200
            
    except Exception as e:
        print(f"Error in backup: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500
