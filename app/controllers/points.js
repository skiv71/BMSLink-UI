angular.module('bmslink.controllers')

.controller('pointsController',['$scope','$window','$http','$interval','host','$localStorage',

    function ($scope,$window,$http,$interval,host,$localStorage) {
       
        var api = host + '/api/points';

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
       
            if (!$localStorage.points) {

                $localStorage.points = defaults;

            }

            $localStorage.navbar.update = $localStorage.points.update;

            var cols = $localStorage.points.columns;

            var data = $localStorage.points.data;

            if ((cols) && (data)) {

                $scope.columns = cols;

                $scope.data = data;

                $scope.ready = true;

            }

            $window.document.title = 'BMSLink - points';

            $localStorage.navbar.route = 'points';

        };

        $scope.save = function(id) {
            
            $window.bootbox.confirm("Are you sure?",function(ok) {

                if (ok) {

                    var index;

                    angular.forEach($scope.data,function(obj,idx) {

                        if (obj.id === id) {

                            index = idx;

                            return;

                        }

                    });

                    var user = [

                        'id',
                        'units',
                        'logging',
                        'purge',
                        'alias'

                    ];

                    var data = [];

                    var term;

                    angular.forEach(user,function(str,idx) {

                        term = $scope.data[index][str];

                        if (term === '') {

                            term = 'null';

                        }

                        data.push(term);

                    });
            
                    var url = api + '/id/' + data.slice(0,1) + '/units,logging,purge,alias/' + encodeURIComponent(data.slice(1).toString());

                    $http.put(url).success(function(data) {

                        console.log(data);

                    });

                    edit = false;

                }

            });

        };

        $scope.delete = function(id) {

            var index;

            angular.forEach($scope.data,function(obj,idx) {

                if (obj.id === id) {

                    index = idx;

                    return;

                }

            });

            $window.bootbox.confirm("Are you sure?",function(ok) {

                if (ok) {

                    var url = api + '/id/' + id;
       
                    $http.delete(url).success(function(data) {

                        $scope.data.splice(index,1);

                        console.log(data);

                    });

                }
                              
            });
  
        };

        $scope.sortBy = function(col) {

            var sort = $localStorage.points.sort;

            var order = sort.slice(0,1);

            var by = sort.slice(1);

            if (by === col) {

                if (order === '-') {

                    order = '+';

                } else {

                    order = '-';

                }

            }

            $localStorage.points.sort = order + col;
           
        };

        $scope.userEdit = function() {

            edit = true;

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

            return array;

        };

        $scope.poll = function() {

            $http.get(api).success(function(json) {

                $scope.data = json;

                $scope.columns = columns(json);

                $localStorage.points.data = $scope.data;

                $localStorage.points.columns = $scope.columns;

                $scope.ready = true;

            });

        };
     
        var longPoll = function() {

            var n = 0;

            var poll;

            poll = $interval(function() {

                var upd = $localStorage.navbar.update;

                $localStorage.points.update = upd;

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