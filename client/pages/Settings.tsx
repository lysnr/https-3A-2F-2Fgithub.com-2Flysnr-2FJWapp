import React, { useState, useEffect } from 'react';
import { User, Palette, Save, Camera, Upload } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'account' | 'appearance'>('account');
  const [accountData, setAccountData] = useState({
    name: 'Dr. Smith',
    email: 'dr.smith@joinwise.com'
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [appearanceData, setAppearanceData] = useState(() => {
    // Load saved appearance settings from localStorage
    const saved = localStorage.getItem('appearanceSettings');
    return saved ? JSON.parse(saved) : {
      font: 'Inter',
      fontSize: 'Medium',
      theme: 'Light'
    };
  });

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: User },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  ];

  // Apply appearance settings on mount and when appearance data changes
  useEffect(() => {
    applyAppearanceSettings();
  }, [appearanceData]);

  // Initialize theme on component mount
  useEffect(() => {
    // Load saved settings and apply immediately
    const saved = localStorage.getItem('appearanceSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      // Apply theme immediately on load
      const root = document.documentElement;
      const body = document.body;

      root.classList.remove('light', 'dark');
      body.classList.remove('light', 'dark');

      if (settings.theme === 'Dark') {
        root.classList.add('dark');
        body.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.add('light');
        body.classList.add('light');
        root.setAttribute('data-theme', 'light');
      }
    }
  }, []);

  const applyAppearanceSettings = () => {
    const root = document.documentElement;
    const body = document.body;

    // Force remove and add theme classes for reliable switching
    root.classList.remove('light', 'dark');
    body.classList.remove('light', 'dark');

    // Apply theme to both html and body elements
    if (appearanceData.theme === 'Dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.add('light');
      body.classList.add('light');
      root.setAttribute('data-theme', 'light');
    }

    // Apply font
    let fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    switch (appearanceData.font) {
      case 'Roboto':
        fontFamily = 'Roboto, sans-serif';
        break;
      case 'Arial':
        fontFamily = 'Arial, sans-serif';
        break;
      case 'Helvetica':
        fontFamily = 'Helvetica, Arial, sans-serif';
        break;
      case 'Open Sans':
        fontFamily = 'Open Sans, sans-serif';
        break;
      case 'Lato':
        fontFamily = 'Lato, sans-serif';
        break;
      default:
        fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    }
    root.style.setProperty('--font-family', fontFamily);
    body.style.fontFamily = fontFamily;

    // Apply font size
    let fontSize = '16px';
    switch (appearanceData.fontSize) {
      case 'Small':
        fontSize = '14px';
        break;
      case 'Medium':
        fontSize = '16px';
        break;
      case 'Large':
        fontSize = '18px';
        break;
      case 'Extra Large':
        fontSize = '20px';
        break;
    }
    root.style.setProperty('--base-font-size', fontSize);
    body.style.fontSize = fontSize;

    console.log(`Theme applied: ${appearanceData.theme}, Font: ${appearanceData.font}, Size: ${appearanceData.fontSize}`);
  };

  const handleAccountSave = () => {
    // Handle account save logic
    console.log('Saving account data:', accountData);
  };

  const handleAppearanceSave = () => {
    // Save to localStorage
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceData));

    // Apply the settings immediately
    applyAppearanceSettings();

    // Force re-render by triggering multiple applications
    setTimeout(() => {
      applyAppearanceSettings();
    }, 50);

    setTimeout(() => {
      applyAppearanceSettings();
    }, 100);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('themeChanged', {
      detail: {
        theme: appearanceData.theme,
        font: appearanceData.font,
        fontSize: appearanceData.fontSize
      }
    }));

    // Show user feedback
    const button = document.querySelector('button[data-action="save-appearance"]');
    if (button) {
      const originalText = button.textContent;
      button.textContent = 'Applied!';
      button.classList.add('bg-green-500');
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('bg-green-500');
      }, 2000);
    }

    console.log('Appearance settings saved and applied:', appearanceData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetDefault = () => {
    setProfileImage(null);
  };

  return (
    <div className="p-6 bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors
                  ${activeTab === tab.id 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'account' && (
          <div className="medical-card p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Account</h2>
              <p className="text-sm text-muted-foreground">
                Manage your account settings and email preferences.
              </p>
            </div>

            <div className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Profile Image
                </label>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <label className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all cursor-pointer flex items-center space-x-2 shadow-lg hover:shadow-xl">
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={handleSetDefault}
                        className="px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                      >
                        Set Default
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a photo to personalize your profile. JPG, PNG or GIF (max 5MB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={accountData.name}
                  onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is the name that will be displayed on your profile.
                </p>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={accountData.email}
                  onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for notifications and account recovery.
                </p>
              </div>

              {/* Save Button */}
              <button
                onClick={handleAccountSave}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Save className="w-4 h-4" />
                <span>Update Account</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="medical-card p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Customize the look and feel of this application.
              </p>
            </div>

            <div className="space-y-6">
              {/* Font Family Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Font Family
                </label>
                <select
                  value={appearanceData.font}
                  onChange={(e) => setAppearanceData({ ...appearanceData, font: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                >
                  <option value="Inter">Inter (Default)</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose the font family for the application.
                </p>
              </div>

              {/* Font Size Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Font Size
                </label>
                <select
                  value={appearanceData.fontSize}
                  onChange={(e) => setAppearanceData({ ...appearanceData, fontSize: e.target.value })}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-medical-blue focus:border-transparent"
                >
                  <option value="Small">Small (14px)</option>
                  <option value="Medium">Medium (16px)</option>
                  <option value="Large">Large (18px)</option>
                  <option value="Extra Large">Extra Large (20px)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Adjust the base font size for better readability.
                </p>
              </div>

              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Theme
                </label>
                <div className="space-y-3">
                  {['Light', 'Dark'].map((theme) => (
                    <label key={theme} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value={theme}
                        checked={appearanceData.theme === theme}
                        onChange={(e) => {
                          const newAppearanceData = { ...appearanceData, theme: e.target.value };
                          setAppearanceData(newAppearanceData);
                          // Apply theme immediately for real-time feedback
                          const root = document.documentElement;
                          const body = document.body;

                          root.classList.remove('light', 'dark');
                          body.classList.remove('light', 'dark');

                          if (e.target.value === 'Dark') {
                            root.classList.add('dark');
                            body.classList.add('dark');
                            root.setAttribute('data-theme', 'dark');
                          } else {
                            root.classList.add('light');
                            body.classList.add('light');
                            root.setAttribute('data-theme', 'light');
                          }
                        }}
                        className="w-4 h-4 text-medical-blue border-border focus:ring-medical-blue"
                      />
                      <span className="text-sm text-foreground">{theme}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Switch between light and dark mode.
                </p>
              </div>

              {/* Preview Section */}
              <div className="p-4 border border-border rounded-lg bg-muted/30">
                <h4 className="text-sm font-medium text-foreground mb-2">Preview</h4>
                <div
                  className="text-foreground"
                  style={{
                    fontFamily: appearanceData.font === 'Inter' ? 'Inter, system-ui, -apple-system, sans-serif' :
                               appearanceData.font === 'Roboto' ? 'Roboto, sans-serif' :
                               appearanceData.font === 'Open Sans' ? 'Open Sans, sans-serif' :
                               appearanceData.font === 'Lato' ? 'Lato, sans-serif' :
                               appearanceData.font === 'Arial' ? 'Arial, sans-serif' :
                               appearanceData.font === 'Helvetica' ? 'Helvetica, Arial, sans-serif' :
                               'Inter, system-ui, -apple-system, sans-serif',
                    fontSize: appearanceData.fontSize === 'Small' ? '14px' :
                             appearanceData.fontSize === 'Medium' ? '16px' :
                             appearanceData.fontSize === 'Large' ? '18px' :
                             appearanceData.fontSize === 'Extra Large' ? '20px' : '16px'
                  }}
                >
                  <p className="mb-2">This is how your text will appear with the selected font and size.</p>
                  <p className="text-muted-foreground">Secondary text in {appearanceData.theme.toLowerCase()} theme.</p>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleAppearanceSave}
                data-action="save-appearance"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Save className="w-4 h-4" />
                <span>Update Appearance</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
