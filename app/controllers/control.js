angular.module('bmslink.controllers')

.controller('controlController',['$scope','$window','$http','$interval','host','$localStorage',

    function ($scope,$window,$http,$interval,host,$localStorage) {

        var api = host + '/api/control';

        var edit = false;

        $scope.user = $localStorage;

        $scope.ready = false;

        $scope.options = {};

        $scope.options['type'] = [

            {
                val: '0',
                text: 'binary'
            },
            {
                val: '1',
                text: 'multistate'
            },
            {
                val: '2',
                text: 'numeric'
            }

        ];

        var init = function() {

            var defaults = {

                update: 30,

                sort: '-name'
            
            }
       
            if (!$localStorage.control) {

                $localStorage.control = defaults;

            }

            $localStorage.navbar.update = $localStorage.control.update;
            
            var cols = $localStorage.control.columns;

            var data = $localStorage.control.data;

            if ((cols) && (data)) {

                $scope.columns = cols;

                $scope.data = data;

                $scope.ready = true;

            }

            $window.document.title = 'BMSLink - control';

            $localStorage.navbar.route = 'control';

        };

        var message = function(msg,callback) {

            setTimeout(function() {

                $window.bootbox.alert(msg);

                if (callback) {

                    callback();

                }

            },500);

        };

        $scope.save = function(obj) {

            if (!obj.name) {

                message('Please enter a name!');
         
                return;

            }

            delete obj.$$hashKey;

            if (obj.id) {

                var data = [];

                angular.forEach(obj,function(val,prop) {

                    data.push(prop + '/' + encodeURIComponent(val));
 
                });

                var url = api + '/' + data.join('/');
      
                $http.put(url).success(function(response) {

                    if (response > 0) {

                        message('Success!',function() {

                            $scope.poll();

                        });
                        
                    } else {

                        message('Failed');

                    }

                });

            } else {

                $http.post(api,obj).success(function(response) {

                    if (response > 0) {

                        message('Success!',function() {

                            $scope.poll();

                        });

                    } else {

                        message('Failed');

                    }

                });

            }

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

        $scope.delete = function(obj) {

            $window.bootbox.confirm("Are you sure?",function(ok) {

                if (!ok) {

                    return;

                }

                if (obj.id) {

                    var url = api + '/id/' + obj.id;
       
                    $http.delete(url).success(function(response) {

                        if (response > 0) {

                            msg = 'Success!';

                        } else {

                            msg = 'Failed';

                        }

                        message(msg, function() {

                            delRow('timestamp',obj.timestamp);


                        });

                    });

                } else {

                    delRow('timestamp',obj.timestamp);

                }

            });
  
        };

        $scope.add = function() {

            edit = true;

            var ts = Date.now().toString().slice(0,-3);
            
            var data = {

                name: '',
                device: '',
                point: '',
                type: '0',
                timestamp: ts

            };

            $localStorage.control.sort = '-name';

            $scope.data.push(data);

        };

        $scope.sortBy = function(col) {

            var sort = $localStorage.control.sort;

            var order = sort.slice(0,1);

            var by = sort.slice(1);

            if (by === col) {

                if (order === '-') {

                    order = '+';

                } else {

                    order = '-';

                }

            }

            $localStorage.control.sort = order + col;
           
        };

        $scope.userEdit = function() {

            edit = true;
        
        };

        $scope.focus = function() {

            edit = true;

        }

        $scope.blur = function() {

            edit = false;

        }

        $scope.set = function(obj,prop) {

            var url = host + '/api/scada';

            var data = {};

            if (obj[prop]) {

                data[obj.name] = obj[prop];

            } else {

                data[obj.name] = prop;

            }

            $http.post(url,data).success(function(response) {

                console.log(response);

                return;

                if (response == 0) {

                    message('Sent!', function() {

                        $scope.poll;

                    });

                } else {

                    message('Failed!');

                }
  
            });

        };

        var columns = function() {

            var array = [

                'name',
                'device',
                'point',
                'type',
                'switch',
                'level',
                'value',
                'timestamp'
            ];
          
            return array;

        };

        $scope.poll = function() {

            $http.get(api).success(function(json) {

                $scope.data = json;

                $scope.columns = columns();

                $localStorage.control.data = $scope.data;

                $localStorage.control.columns = $scope.columns;

                $scope.ready = true;

            });

        };
     
        var longPoll = function() {

            var n = 0;

            var poll;

            poll = $interval(function() {

                var upd = $localStorage.navbar.update;

                $localStorage.control.update = upd;

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