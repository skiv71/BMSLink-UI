angular.module('bmslink.controllers')

.controller('logsController',['$scope','$interval','$localStorage','API','common',

    function ($scope,$interval,$localStorage,API,common) {

        var resource = 'logs';

        $scope.user = $localStorage;
        
        $scope.ready = false;

        $scope.selectAll;

        $scope.marked = {};

        $scope.filteredList = [];

        $scope.toggleAll = function() {

            var list = $scope.filteredList;

            var all = $scope.selectAll;

            angular.forEach(list,function(obj,idx) {

                $scope.marked[obj.id] = all;

            });

        }
        
        $scope.reset = function() {
           
            setTimeout(function() {

                $scope.data = [];

                $scope.marked = {};

                $scope.text = '';

                $scope.timestamp = '';

                setTimeout(function() {

                    poll();

                },100);
          
            },100);
      
        };

        var init = function() {

            var defaults = {
              
                sort: '-timestamp'
            
            }
       
            if (!$localStorage[resource]) {

                $localStorage[resource] = defaults;

            }

            $localStorage.navbar.route = resource;

            common.title(resource);

            $localStorage.navbar.update = 0;

        };

        var deleteBatch = function(array) {

            var len = array.length;

            (function loop(n) {

                if (n == len) {

                    setTimeout(function() {
                        
                        $scope.selectAll = false;

                        $scope.marked = {};

                        $scope.showLogs();

                    },2000);

                    return;

                } else {

                    var data = {};

                    data.id = array[n].join(',');

                    API.DELETE(resource,data, function(response) {

                        if (response > 0) {

                            loop(n + 1);

                        } else {

                            common.message('Failed!', function() {

                                return;

                            });

                        }

                    });

                }
       
            })(0);

        }
          
        $scope.delete = function() {

            var list = $scope.marked;

            var ids = [];

            var i = 0;

            angular.forEach(list,function(val,key) {

                if (val) {

                    ids.push(key);

                }

            });

            if (ids.length > 0) {

                common.confirm(function() {

                    common.splitArray(ids,100, function(array) {

                        deleteBatch(array);

                    });

                });

            } else {

                common.message('No records selected!');

            }

       
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

        var pagesList = function() {

            var log = $scope.log;

            var list = $scope.records[log];

            var pages = [];

            var page;

            angular.forEach(list,function(range,idx) {

                page = idx + 1;

                pages.push('Page ' + page);

            })

            $scope.pages = pages;

            $scope.page = '0';

        }

        var poll = function() {

            API.GET(resource, function(json) {

                $scope.records = json;

                var list = [];

                angular.forEach(json,function(range,log) {

                    list.push(log);

                });

                $scope.logs = list;
  
                $scope.ready = true;

                if (!$scope.log) {
                        
                    $scope.log = $scope.logs[0];

                }

                pagesList();

            });

        };

        $scope.showLogs = function() {

            var ids = $scope.records[$scope.log][$scope.page];

            var url = resource + '/log/' + $scope.log + '?id=' + ids.join('-');

            API.GET(url, function(json) {

                $scope.data = json;

            });

        };

        //$scope.export = function() {

        //    common.exportToPDF('logs',$scope.log);

        //};
       
        init();

        poll();
    
    }

]);