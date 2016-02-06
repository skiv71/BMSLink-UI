angular.module('bmslink.services')

.factory('API',['common','$http',

    function (common,$http) {

        return ({

            GET: function(resource,callback) {

                if (callback) {

                    var url = common.URL(resource);

                    $http.get(url).success(function(json) {

                        callback(json);

                    });

                } else {

                    common.invalid('parameters!');

                }

           },

            POST: function(resource,data,callback) {

                if (callback) {

                    var url = common.URL(resource);
  
                    $http.post(url,data).success(function(response) {

                        callback(response);

                    });

                } else {

                    common.invalid('parameters!');

                }

            },

            PUT: function(resource,data,callback) {

                if (callback) {

                    var array = [];

                    angular.forEach(data,function(val,prop) {

                        if (val.length == 0)

                            val = 'NULL';

                        array.push(prop + '/' + encodeURIComponent(val));
 
                    });

                    var url = common.URL(resource + '/' + array.join('/'));

                    $http.put(url).success(function(response) {

                        callback(response);

                    });

                } else {

                    common.invalid('parameters!');

                }

            },

            DELETE: function(resource,data,callback) {

                if (callback) {

                    if (data.id) {

                        var url = common.URL(resource + '/id/' + data.id);

                        $http.delete(url).success(function(response) {

                            callback(response);

                        });

                    } else {

                        common.invalid('object!');

                    }

                } else {

                    common.invalid('parameters!');

                }

            },

            scada: function(cmd,callback) {
   
                var url = common.URL('scada');

                var msg;

                $http.post(url,cmd).success(function(response) {
              
                    if (response == 0) {

                        msg = 'Queued!';

                    } else {

                        msg = 'Failed!';

                    }

                    if (callback) {

                        common.message(msg, function() {

                            callback(response);

                        });

                    }

                });
 
            }

        });

    }

]);