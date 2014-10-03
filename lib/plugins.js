var _ = require( 'lodash' );
var Slap = require( './ui/Slap' );

module.exports = function( ) {

  var pluginsDir = Slap.normalizePath( this.opts.plugins.pluginsDir );
  
  var pkg = loadPkg.call( this, pluginsDir );
  if ( !pkg ) {
    return this.logger.error( new Error( pluginsDir + '/package.json does not exsist' ) );
  }

  this.plugins = {};

  var plugins = pkg.dependencies;
  _.forEach( plugins, loadPlugin.bind( this, pluginsDir ) );
};

function loadPkg ( dir ) {
  var pkgPath = dir + '/package.json';
  var pkg = require( pkgPath );

  try {
    pkgPath = require( pkgPath)
  }
  catch ( err ) {
    this.logger.err( err );
    pkgPath = null;
  }

  return pkgPath; 
}

function mountPlugin( name, main ) { 
  var _plugin;
  try { // eat errors
    _plugin = require( main );
  }
  catch ( e ) {
    this.logger.err( name, err );
    _plugin = null;
  }

  if ( _plugin && typeof _plugin === 'function' ) {
    this.plugins[ name ] = _plugin( this );
    this.logger.info( 'Loaded plugin ' + name );
  }
}

function loadPlugin( dir, version, plugin ) {  
  var pluginPath = dir + '/node_modules/' + plugin;

  var pkg = loadPkg.call( this, pluginPath );
  if ( !pkg ) {
    return this.logger.err( new Error( pluginPath + '/package.json could not be found' ) );
  }
  var mainPath = pluginPath + '/' + pkg.main;
  mountPlugin.call( this, plugin, mainPath );
}