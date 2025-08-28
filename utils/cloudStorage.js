// utils/cloudStorage.js

// Google Drive Integration
export class GoogleDriveIntegration {
  constructor() {
    this.isLoaded = false;
    this.isAuthenticated = false;
    this.authInstance = null;
  }

  async loadGoogleAPI() {
    if (this.isLoaded) return;
    
    return new Promise((resolve, reject) => {
      // Check if gapi is already loaded
      if (window.gapi) {
        this.isLoaded = true;
        resolve();
        return;
      }

      // Load Google API script
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.gapi.load('auth2:picker:client', {
          callback: () => {
            this.isLoaded = true;
            resolve();
          },
          onerror: (error) => {
            console.error('Failed to load Google APIs:', error);
            reject(error);
          }
        });
      };
      script.onerror = (error) => {
        console.error('Failed to load Google API script:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  async initGooglePicker(apiKey, clientId) {
    try {
      console.log('Initializing Google Picker with:', { apiKey: apiKey?.substring(0, 10) + '...', clientId });
      
      await this.loadGoogleAPI();
      
      // Initialize the API client with minimal config
      await window.gapi.client.init({
        apiKey: apiKey,
        clientId: clientId,
        scope: 'https://www.googleapis.com/auth/drive.readonly',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
      });
      
      // Initialize auth2 separately
      this.authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!this.authInstance) {
        this.authInstance = await window.gapi.auth2.init({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.readonly'
        });
      }
      
      console.log('Google Drive API initialized successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error);
      throw new Error(`Google Drive initialization failed: ${error.message}`);
    }
  }

  async authenticateUser() {
    if (!this.authInstance) {
      throw new Error('Google API not initialized');
    }

    try {
      const user = this.authInstance.currentUser.get();
      
      if (!user.isSignedIn()) {
        console.log('User not signed in, prompting for authentication...');
        
        // Use signIn with immediate: false to show popup
        const authResult = await this.authInstance.signIn({
          prompt: 'consent',
          ux_mode: 'popup'
        });
        
        console.log('Authentication successful:', authResult);
      }
      
      const currentUser = this.authInstance.currentUser.get();
      const authResponse = currentUser.getAuthResponse();
      
      if (!authResponse || !authResponse.access_token) {
        throw new Error('Failed to get access token');
      }
      
      this.isAuthenticated = true;
      return authResponse.access_token;
      
    } catch (error) {
      console.error('Authentication failed:', error);
      
      // If it's a popup blocked error, provide user-friendly message
      if (error.error === 'popup_blocked_by_browser') {
        throw new Error('Popup was blocked by browser. Please allow popups for this site and try again.');
      }
      
      throw new Error(`Authentication failed: ${error.details || error.message}`);
    }
  }

  async openGoogleDrivePicker(apiKey, clientId, callback) {
    try {
      console.log('Opening Google Drive Picker...');
      
      // Ensure API is loaded and user is authenticated
      const initSuccess = await this.initGooglePicker(apiKey, clientId);
      if (!initSuccess) {
        throw new Error('Failed to initialize Google Picker');
      }
      
      const accessToken = await this.authenticateUser();
      console.log('Got access token, creating picker...');
      
      // Enhanced picker configuration
      const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES)
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false)
        .setMode(window.google.picker.DocsViewMode.LIST);

      const picker = new window.google.picker.PickerBuilder()
        .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
        .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
        .setAppId(clientId.split('.')[0]) // Extract app ID from client ID
        .setOAuthToken(accessToken)
        .addView(view)
        .addView(new window.google.picker.DocsView(window.google.picker.ViewId.DOCS_IMAGES_AND_VIDEOS))
        .setDeveloperKey(apiKey)
        .setCallback((data) => {
          console.log('Picker callback received:', data);
          
          if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
            console.log('File picked:', data.docs[0]);
            callback(data);
          } else if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.CANCEL) {
            console.log('Picker cancelled by user');
          }
        })
        .setTitle('Select an image from Google Drive')
        .setSize(1051, 650)
        .setLocale('en')
        .build();
      
      // Add a small delay to ensure DOM is ready
      setTimeout(() => {
        picker.setVisible(true);
      }, 100);
      
    } catch (error) {
      console.error('Failed to open Google Drive picker:', error);
      throw error;
    }
  }

  async downloadFile(fileId, accessToken) {
    try {
      console.log('Downloading file:', fileId);
      
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/octet-stream'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const blob = await response.blob();
      console.log('File downloaded successfully:', blob.size, 'bytes');
      return blob;
      
    } catch (error) {
      console.error('Failed to download file from Google Drive:', error);
      throw error;
    }
  }
}

// OneDrive Integration
export class OneDriveIntegration {
  constructor() {
    this.isLoaded = false;
  }

  async loadOneDriveAPI() {
    if (this.isLoaded) return;
    
    return new Promise((resolve, reject) => {
      // Check if OneDrive is already loaded
      if (window.OneDrive) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.live.net/v7.2/OneDrive.js';
      script.async = true;
      script.onload = () => {
        this.isLoaded = true;
        console.log('OneDrive API loaded successfully');
        resolve();
      };
      script.onerror = (error) => {
        console.error('Failed to load OneDrive API:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  async openOneDrivePicker(clientId, callback) {
    try {
      console.log('Opening OneDrive picker...');
      await this.loadOneDriveAPI();
      
      const pickerOptions = {
        clientId: clientId,
        action: "download",
        multiSelect: false,
        openInNewWindow: false, // Try inline first
        advanced: {
          filter: "folder,photo",
          queryParameters: "select=id,name,size,file,folder,photo,image,@microsoft.graph.downloadUrl"
        },
        success: (response) => {
          console.log('OneDrive picker success:', response);
          callback(response);
        },
        cancel: () => {
          console.log('OneDrive picker cancelled');
        },
        error: (error) => {
          console.error('OneDrive picker error:', error);
          throw new Error(`OneDrive picker error: ${error.message || 'Unknown error'}`);
        }
      };

      window.OneDrive.open(pickerOptions);
      
    } catch (error) {
      console.error('Failed to load OneDrive picker:', error);
      throw error;
    }
  }
}

// Utility function to detect if user is on desktop
export const isDesktop = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
  
  // Consider tablets as non-desktop for picker compatibility
  return !isMobile && !isTablet && window.innerWidth >= 1024;
};

// Utility function to convert blob to file
export const blobToFile = (blob, fileName) => {
  const timestamp = new Date().getTime();
  const safeName = fileName || `image_${timestamp}`;
  
  // Clean filename and ensure it has an extension
  const cleanName = safeName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const finalName = cleanName.includes('.') ? cleanName : `${cleanName}.jpg`;
  
  return new File([blob], finalName, { 
    type: blob.type || 'image/jpeg',
    lastModified: timestamp
  });
};