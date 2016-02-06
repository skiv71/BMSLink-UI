angular.module('bmslink.controllers')

.controller('controlController',['$scope','$interval','$localStorage','API','common',

    function ($scope,$interval,$localStorage,API,common) {

        var resource = 'control';

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
       
            if (!$localStorage[resource]) {

                $localStorage[resource] = defaults;

            }

            $localStorage.navbar.update = $localStorage[resource].update;
            
            var cols = $localStorage[resource].columns;

            var data = $localStorage[resource].data;

            if ((cols) && (data)) {

                $scope.columns = cols;

                $scope.data = data;

                $scope.ready = true;

            }

            common.title(resource);

            $localStorage.navbar.route = resource;

        };

    
        $scope.save = function(obj) {

            var method;

            if (obj.name) {

                var data = angular.copy(obj);

                delete data.$$hashKey;

                if (data.id) {

                    method = 'PUT';
       
                } else {

                    method = 'POST';

                }

                API[method](resource,data,function(response) {

                    if (response > 0) {

                        common.message('Success!',function() {

                            $scope.poll();

                        });

                    } else {

                        common.message('Failed');

                    }

                });

            } else {

                common.message('Please enter a name!');

            }

        };

        var delRow = function(prop,val) {

            var data = {

                array: $scope.data,
                prop: prop,
                val: val

            };

            common.index(data, function(idx) {

                $scope.data.splice(idx,1);

                edit = false;
    
            });

        };

        $scope.delete = function(obj) {

            common.confirm(function() {

                if (obj.id) {

                    API.DELETE(resource,obj, function(response) {

                        common.message(msg, function() {

                            delRow('id',obj.id);

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

            var sort = $localStorage[resource].sort;

            var order = sort.slice(0,1);

            var by = sort.slice(1);

            if (by === col) {

                if (order === '-') {

                    order = '+';

                } else {

                    order = '-';

                }

            }

            $localStorage[resource].sort = order + col;
           
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

            var cmd = {};

            var val;
       
            if (obj[prop]) {

                val = obj[prop];

            } else {

                val = prop;

            }

            cmd[obj.name] = val;

            API.scada(cmd);

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

            API.GET(resource, function(json) {
     
                $scope.data = json;

                $scope.columns = columns();

                $localStorage[resource].data = $scope.data;

                $localStorage[resource].columns = $scope.columns;

                $scope.ready = true;

            });

        };
     
        var longPoll = function() {

            var n = 0;

            var poll;

            poll = $interval(function() {

                var upd = $localStorage.navbar.update;

                $localStorage[resource].update = upd;

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