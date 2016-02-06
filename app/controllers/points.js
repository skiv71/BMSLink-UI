angular.module('bmslink.controllers')

.controller('pointsController',['$scope','$interval','$localStorage','API','common',

    function ($scope,$interval,$localStorage,API,common) {

        var resource = 'points';
       
        var edit = false;

        $scope.user = $localStorage;

        $scope.ready = false;

        $scope.options = {};

        $scope.options['logging'] = [

            {
                val: '0',
                text: 'disabled'
            },
            {
                val: '-1',
                text: 'on change'
            },
            {
                val: '-2',
                text: 'on update'
            },
            {
                val: '1',
                text: 'every minute'
            },
            {
                val: '5',
                text: 'every 5 minutes'
            },
            {
                val: '15',
                text: 'every 15 minutes'
            },
            {
                val: '30',
                text: 'every 30 minutes'
            },
            {
                val: '60',
                text: 'every hour'
            }

        ];

        $scope.options['purge'] = [

            {
                val: '0',
                text: 'disabled'
            },
            {
                val: '1',
                text: '1 day'
            },
            {
                val: '3',
                text: '3 days'
            },
            {
                val: '7',
                text: '1 week'
            },
            {
                val: '14',
                text: '2 weeks'
            },
            {
                val: '30',
                text: '1 month'
            },
            {
                val: '90',
                text: '3 months'
            },
            {
                val: '180',
                text: '6 months'
            },
            {
                val: '365',
                text: '1 year'
            }

        ];

        var init = function() {

            var defaults = {

                update: 30,

                sort: '-device'
            
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

        $scope.save = function(obj) {

           var items = [

                'id',
                'units',
                'logging',
                'purge',
                'alias'
            
            ];

            common.items(obj,items, function(data) {

                API.PUT(resource,data,function(response) {

                    if (response > 0) {

                        common.message('Success!',function() {

                            $scope.poll();

                        });

                    } else {

                        common.message('Failed');

                    }

                });

            });

        };
        
        $scope.delete = function(obj) {

            common.confirm(function() {

                API.DELETE(resource,obj, function(response) {

                    if (response > 0) {

                        common.message(msg, function() {

                            delRow('id',obj.id);

                        });

                    } else {

                        common.message('Failed!');

                    }

                });

            });

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

        var columns = function(json,callback) {

            if (callback) {

                common.columns(json, function(array) {

                    callback(array);

                });

            }

        };

        $scope.poll = function() {

            API.GET(resource, function(json) {

                $scope.data = json;

                columns(json, function(cols) {

                    $scope.columns = cols;

                });

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