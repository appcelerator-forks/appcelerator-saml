var fs = require('fs');
/**
 * this is a built-in auth strategy that will look for a specific
 * strategy defined in the configuration and will either load an
 * internal one (if required) or resolve to a third-party one.
 * this class acts as a fascade on top of the real one we find
 */
function AuthStrategy(server) {
	var config = server.config;
	this.delegate = null;
	var value = config.APIKeyAuthType;
	// if you don't set it, we don't use auth
	if (!value) { return; }

	//Check if APIKeyAuthType == plugin
	//Value must be of type plugin_dir
	if(server.APIKeyAuthType && server.APIKeyAuthType.toLowerCase() == 'plugin' && config.APIKeyAuthPlugin)
	{	
		var plugin_path = path.resolve(process.cwd(), '/node_modules/' + config.APIKeyAuthPlugin); //process.cwd() + '/node_modules/' + value;
		if(fs.existsSync(plugin_path)){
			server.logger.debug('Loading plugin from : ', plugin_path);
            console.log('Loaded afterwords')
		}
	}	

	switch (value) {
		case 'apikey':
			this.delegate = new (require('./headervalue'))(server);
			break;
		case 'basic':
			this.delegate = new (require('./headerauthbasic'))(server);
			config.APIKeyAuthType = 'basic'; // in case not set
			break;
		case 'ldap':
			this.delegate = new (require('./ldap'))(server);
			break;
		case 'plugin':
			// this is a third-party module, so let's require it
			if (!config.APIKeyAuthPlugin) {
				throw new Error('APIKeyAuthType is plugin but missing the key APIKeyAuthPlugin');
			}
			var fs = require('fs'),
				path = require('path'),
			// attempt to set the right location and see if it's a file
				p = path.resolve(process.cwd(), config.APIKeyAuthPlugin);
			if (!fs.existsSync(p)) {
				// see if we need to append js
				if (path.extname(p) !== '.js') {
					p += '.js';
					if (!fs.existsSync(p)) {
						// see if we can just load as a node_module module
						p = path.resolve(process.cwd(), 'node_modules', config.APIKeyAuthPlugin);
						if (!fs.existsSync(p)) {
							// just fallback, maybe it's global
							p = config.APIKeyAuthPlugin;
						}
					}
				}
			}
			server.logger.debug('trying to load authentication plugin from:', p);
			this.delegate = new (require(p))(server);
			break;
		case 'none':
			// no authentication
			break;
		default:
			throw new Error('unknown APIKeyAuthType value: ' + value + '. should be one of: apikey, plugin, basic (default)');
	}
	if (!this.delegate) {
		server.logger.warn('No APIKey or APIKeyAuthPlugin set in your config.  Your server has no authentication strategy.');
	}
}

/**
 * called by the server before calling validateRequest to determine if you want
 * to require authentication for this url
 */
AuthStrategy.prototype.matchURL = function (req) {
	if (this.delegate) {
		if (this.delegate.matchURL) {
			return this.delegate.matchURL(req);
		}
		// if not provided, we always validate
		return true;
	}
	return false;
};

/**
 * called by the server to request validation of the incoming request. return true if
 * a valid request, return false (or undefined) to deny the request
 */
AuthStrategy.prototype.validateRequest = function (req, resp, next) {
	if (this.delegate) {
		if (this.delegate.validateRequest.length > 2) {
			return this.delegate.validateRequest(req, resp, next);
		} else {
			var result = this.delegate.validateRequest(req, resp);
			next(null, result);
		}
	} else {
		next(null, true);
	}
};

/**
 * used by the documentation Test API to allow the plugin to control any authentication
 * headers, etc that should be applied to the request before sending the request.  The
 * opts object is the same object passed to the 'request' node library used to make the
 * URL request.
 */
AuthStrategy.prototype.applyCredentialsForTest = function (opts) {
	if (this.delegate && this.delegate.applyCredentialsForTest) {
		this.delegate.applyCredentialsForTest(opts);
	}
};

/**
 * used by the documentation Test API to allow the plugin to control any authentication
 * response headers, body, etc.
 */
AuthStrategy.prototype.applyResponseForTest = function (response, body) {
	if (this.delegate && this.delegate.applyResponseForTest) {
		return this.delegate.applyResponseForTest(response, body);
	}
	return body;
};

module.exports = AuthStrategy;