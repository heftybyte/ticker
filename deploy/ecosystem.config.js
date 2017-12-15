module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    // First application
    {
      name      : 'Ticker',
      script    : 'server.js',
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
      "key"  : "/Users/Samparsky/Sites/hbyte/server/parity-server.pem", // path to the private key to authenticate
      repo : 'git@github.com:heftybyte/ticker.git',
      "ssh_options": ["StrictHostKeyChecking=no", "PasswordAuthentication=no"],
      path : '/home/ubuntu/ticker/',
      'post-deploy' : 'sh deploy/deploy.sh'
    },
  }
};

