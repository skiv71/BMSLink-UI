angular.module('bmslink.services')

.factory('common',['$window','host',

    function ($window,host) {

        return ({

            URL: function(resource) {

                return host + '/api' + '/' + resource;

            },

            invalid: function(text) {

                console.log('invalid ' + text);

            },

            message: function(msg,callback) {

                setTimeout(function() {

                    $window.bootbox.alert(msg, function() {

                        if (callback)

                            callback();

                    });

                },500);

            },

            confirm: function(callback) {

                $window.bootbox.confirm("Are you sure?",function(ok) {

                    if (ok) {

                        if (callback)

                            callback();

                    }

                });

            },

            title: function(text) {

                $window.document.title = 'BMSLink - ' + text;

            },

            index: function(data,callback) {

                if (callback) {

                    if ((data.array) && (data.prop) && (data.val)) {

                        angular.forEach(data.array,function(obj,idx) {

                            if (obj[data.prop] == data.val)

                                callback(idx);

                        });

                    } else {

                        common.invalid('object!');

                    }

                } else {

                    common.invalid('parameters!');

                }

            },

            columns: function(json,callback) {

                if (callback) {

                    var array = [];

                    var i = 0;

                    angular.forEach(json[0],function(val,key) {

                        if (i > 0) {

                            array.push(key);

                        }
                         
                        i++;
                      
                    });

                    callback(array);

                } else {

                    common.invalid('parameters!');

                }

            },

            items: function(obj,items,callback) {

                if ((callback) && (angular.isArray(items))) {

                    var data = {};
         
                    angular.forEach(obj, function(val,key) {

                        if (items.indexOf(key) > -1)

                            data[key] = val;

                    });

                    callback(data);

                } else {

                    common.invalid('parameters!');

                }

            },

            splitArray: function(array,length,callback) {

                var split = [];

                var i = 0;

                var j;

                if (length) {

                    while (array[i]) {

                        j = i + length;

                        split.push(array.slice(i,j));

                        i = j++;

                    }

                } else {

                    common.invalid('parameters!');

                    return;

                }

                if (callback) {

                   callback(split);

                } else {

                    return split;

                }

            },
            
            exportToPDF: function(name,data) {

                if (data) {

                    $window.exportToPDF(name,data);

                } else {

                    common.invalid('parameters!');

                }

            }

        });

    }

]); 