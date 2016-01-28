angular.module('bmslink.controllers')

.controller('logsController',['$scope','$window','$http','$interval','host','$localStorage',

    function ($scope,$window,$http,$interval,host,$localStorage) {

        var api = host + '/api/logs';

        var records;

        $scope.user = $localStorage;
        
        $scope.ready = false;

        $scope.selectAll;

        $scope.marked = {};

        $scope.filteredList = [];

        $scope.options = {};

        $scope.options['order'] = [

            {
                val: 'desc',
                text: 'descending'
            },
            {
                val: 'asc',
                text: 'ascending'
            },
 
        ];
     
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
       
            if (!$localStorage.logs) {

                $localStorage.logs = defaults;

            }

            $window.document.title = 'BMSLink - logs';

            $localStorage.navbar.route = 'logs';

            $localStorage.navbar.update = 0;

        };
          
        $scope.delete = function() {

            $window.bootbox.confirm("Are you sure?",function(ok) {

                if (!ok) {

                    return;

                }

                var list = $scope.marked;

                var obj = {};

                var i = 0;
       
                angular.forEach(list,function(val,key) {

                    if (!obj[i]) {

                        obj[i] = [];

                    }

                    if (val) {
             
                        obj[i].push(key);

                    }

                    if (obj[i].length > 99) {

                        i++;
                  
                    }                        

                });

                var url;

                (function loop(n) {

                    if (n > i) {

                        setTimeout(function() {
                            
                            $scope.selectAll = false;

                            $scope.marked = {};

                            $scope.showLogs();

                        },2000);

                        return;

                    } else {
               
                        url = api + '/id/' + obj[n];
           
                        $http.delete(url).success(function(data) {
 
                            loop(n + 1);

                        });

                    }
           
                })(0);
         
 
            });

        };

        $scope.sortBy = function(col) {

            var sort = $localStorage.logs.sort;

            var order = sort.slice(0,1);

            var by = sort.slice(1);

            if (by === col) {

                if (order === '-') {

                    order = '+';

                } else {

                    order = '-';

                }

            }

            $localStorage.logs.sort = order + col;
           
        };

        var poll = function() {

            var url = api;

            $http.get(url).success(function(obj) {

                records = obj.logs;

                var list = [];
            
                angular.forEach(records,function(val,key) {

                    list.push(key);
  
                });

                if (list.length < 1) {

                    var msg = 'No logs found!';

                    $window.bootbox.alert(msg);

                    return;

                }

                $scope.logs = list;

                if (!$scope.log) {
                        
                    $scope.log = $scope.logs[0];

                }

                var pages = [];

                var page = 1;

                angular.forEach(records[$scope.log],function(val,idx) {

                    pages.push({

                        val: idx,
                        text: 'page ' + page

                    });

                    page++;

                });
               
                $scope.pages = pages;

                $scope.page = 0;

                if (!$scope.order) {
                        
                    $scope.order = 'desc';

                }
                
                $scope.ready = true;

            });

        };

        $scope.showLogs = function() {

            var array = records[$scope.log];

            var id = array[$scope.page];

            var limit = 1000;

            var url = api + '/log,' + $scope.log + '/id,' + id + '-/order,epoch/sort,' + $scope.order + '/limit,' + limit;
          
            $http.get(url).success(function(json) {

                $scope.data = json;

            });

        };

        $scope.export = function() {

            $window.exportToPDF('logs',$scope.log);

        };
       
        init();

        poll();
    
    }

]);