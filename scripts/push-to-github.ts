import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

async function main() {
  try {
    const octokit = await getUncachableGitHubClient();
    
    // Get username
    const { data: user } = await octokit.users.getAuthenticated();
    console.log('GitHub Username:', user.login);
    console.log('Email:', user.email);
    
    // Create repository
    try {
      const { data: repo } = await octokit.repos.createForAuthenticatedUser({
        name: 'petspeak',
        description: 'PetSpeak - AI-powered animal sound recognition and translation app',
        private: false,
        auto_init: false,
      });
      console.log('Created new repository:', repo.html_url);
    } catch (error: any) {
      if (error.status === 422) {
        console.log('Repository already exists');
      } else {
        throw error;
      }
    }
    
    // Get access token for git
    const token = await getAccessToken();
    console.log('GITHUB_TOKEN=' + token);
    console.log('GITHUB_USERNAME=' + user.login);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
