module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    // First application
    {
      name      : 'Tokens Express',
      script    : 'server/server.js',
    },
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'ubuntu',
      host : '52.89.161.39',
      ref  : 'origin/master',
      repo : 'git@github.com:heftybyte/ticker.git',
      "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
      path : '/var/www/ticker/',
      'post-deploy' : 'sh deploy/deploy.sh'
    },
  }
};
