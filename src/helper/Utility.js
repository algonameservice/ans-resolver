module.exports.NormalizeName = function(name) {
    name = name.toLowerCase();
    if(name.split('.algo').length === 1) {
        name = name+'.algo';
    }
    return name;
}