-- Yeni yapıda tabloyu oluştur
CREATE TABLE system_settings (
    id BIGINT PRIMARY KEY DEFAULT 1,
    settings JSONB NOT NULL DEFAULT jsonb_build_object(
        'defaultTrialDays', 30,
        'autoRenewLicense', false,
        'emailNotifications', jsonb_build_object(
            'newUser', true,
            'licenseExpiry', true,
            'systemAlerts', true
        ),
        'notificationEmail', '',
        'require2FA', false,
        'sessionTimeout', 60,
        'maxLoginAttempts', 5,
        'autoBackup', true,
        'backupTime', '02:00',
        'backupRetentionDays', 30
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Varsayılan ayarları ekle (eğer tablo boşsa)
INSERT INTO system_settings (id)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE id = 1);

-- Mevcut verileri JSONB sütununa aktar
UPDATE system_settings
SET settings = jsonb_build_object(
    'defaultTrialDays', default_trial_period,
    'autoDeactivateExpired', auto_deactivate_expired,
    'trialEndNotificationDays', trial_end_notification_days,
    'notifyOnNewUser', notify_on_new_user,
    'require2FA', require_admin_two_factor,
    'logFailedLoginAttempts', log_failed_login_attempts,
    'emailNotifications', jsonb_build_object(
        'newUser', notify_on_new_user,
        'licenseExpiry', true,
        'systemAlerts', true
    ),
    'sessionTimeout', 60,
    'maxLoginAttempts', 5,
    'autoBackup', true,
    'backupTime', '02:00',
    'backupRetentionDays', 30,
    'notificationEmail', ''
);

-- Eski sütunları kaldır
ALTER TABLE system_settings
DROP COLUMN default_trial_period,
DROP COLUMN auto_deactivate_expired,
DROP COLUMN trial_end_notification_days,
DROP COLUMN notify_on_new_user,
DROP COLUMN require_admin_two_factor,
DROP COLUMN log_failed_login_attempts; 