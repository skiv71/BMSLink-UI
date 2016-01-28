angular.module('bmslink.controllers')

.controller('devicesController',['$scope','$window','$http','$interval','host','$localStorage',

    function ($scope,$window,$http,$interval,host,$localStorage) {
      
        var api = host + '/api/devices';

        edit = false;

        $scope.user = $localStorage;

        $scope.ready = false;

        $scope.options = {};

        $scope.options['autostart'] = [

            {
                val: '0',
                text: 'disabled'
            },
            {
                val: '1',
                text: 'enabled'
            }
          
        ];

        $scope.options['logging'] = [

            {
                val: '0',
                text: 'disabled'
            },
            {
                val: '1',
                text: 'enabled'
            }
          
        ];

        var init = function() {

            var defaults = {

                update: 30,

                sort: '-name'
            
            }
       
            if (!$localStorage.devices) {

                $localStorage.devices = defaults;

            }

            $localStorage.navbar.update = $localStorage.devices.update;
            
            var cols = $localStorage.devices.columns;

            var data = $localStorage.devices.data;

            if ((cols) && (data)) {

                $scope.columns = cols;

                $scope.data = data;

                $scope.ready = true;

            }

            $window.document.title = 'BMSLink - devices';

            $localStorage.navbar.route = 'devices';

        };

        var message = function(msg,callback) {

            setTimeout(function() {

                $window.bootbox.alert(msg);

                if (callback) {

                    callback();

                }

            },500);

        };

        var delRow = function(prop,val) {

            angular.forEach($scope.data,function(obj,idx) {

                if (obj[prop] == val) {

                    $scope.data.splice(idx,1);

                    edit = false;

                    return;

                }

            });

        };

        $scope.save = function(obj) {

            var url = api + '/id/' + obj.id + '/autostart/' + obj.autostart + '/logging/' + obj.logging;

            console.log(url);
                   
            $http.put(url).success(function(response) {

                if (response > 0) {

                    msg = 'Success!';

                } else {

                    msg = 'Failed!';

                }
 
                message(msg);
 
            });
              
        };
      
        $scope.delete = function(obj) {
           
            $window.bootbox.confirm('Are you sure?',function(ok) {

                if (!ok) {

                    return;
                }

                var url = api + '/id/' + obj.id;
 
                $http.delete(url).success(function(response) {
              
                    if (response > 0) {

                        msg = 'Success!';

                    } else {

                        msg = 'Failed!';

                    }
 
                    message(msg,function() {

                        if (response > 0) {

                            delRow('serial',obj.serial);

                        }

                    });
                     
                });

            });
     
        };

        $scope.sortBy = function(col) {

            var sort = $localStorage.devices.sort;

            var order = sort.slice(0,1);

            var by = sort.slice(1);

            if (by === col) {

                if (order === '-') {

                    order = '+';

                } else {

                    order = '-';

                }

            }

            $localStorage.devices.sort = order + col;
           
        };

        $scope.set = function(obj,cmd) {
      
            var data = {};

            data['cmd'] = [

                'dev-ctrl',
                obj.serial,
                cmd

            ];
  
            $http.post(api,data).success(function(response) {

                message(response);

            });
             
       };

        $scope.scan = function() {

            var data = {};

            data['cmd'] = [

                'dev-scan'
                     
            ];

            $http.post(api,data).success(function(response) {
             
                message(response);
                
            });

        };

        var columns = function(json) {

            var array = [];

            var i = 0;

            angular.forEach(json[0],function(val,key) {

                if (i > 0) {

                    array.push(key);

                }
                 
                i++;
              
            });

            array.splice(3,0,'interface');
         
            array.splice(6,1);
    
            return array;

        };

        $scope.poll = function() {

            $http.get(api).success(function(json) {

                $scope.data = json;

                $scope.columns = columns(json);

                $localStorage.devices.data = $scope.data;

                $localStorage.devices.columns = $scope.columns;

                $scope.ready = true;

            });

        };
     
        var longPoll = function() {

            var n = 0;

            var poll;

            poll = $interval(function() {

                var upd = $localStorage.navbar.update;

                $localStorage.devices.update = upd;

                if ((upd) && (!edit)) {

                    if (upd == n) {

                        $scope.poll();

                        n = 0;

                    }

                    n++

                } else {

                    n = 0;

                }
     
            },1000);

            $scope.$on('$destroy', function () {

                $interval.cancel(poll);

            });

        };

        init();

        $scope.poll();

        longPoll();

    }

]);