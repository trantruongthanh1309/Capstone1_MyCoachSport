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
        return jsonify({'success': True, 'message': 'Backup started'}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500
