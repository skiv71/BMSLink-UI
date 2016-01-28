angular.module('bmslink.controllers')

.controller('navbarController',['$scope','$localStorage','$location',

    function ($scope,$localStorage,$location) {

        $scope.user = $localStorage;

        $scope.update = false;

        $scope.options = {};
        
        $scope.options['update'] = [

            {
                val: 0,
                text: 'manual'
            },
            {
                val: 1,
                text: '1 second'
            },
            {
                val: 2,
                text: '2 seconds'
            },
            {
                val: 5,
                text: '5 seconds'
            },
            {
                val: 15,
                text: '15 seconds'
            },
            {
                val: 30,
                text: '30 seconds'
            },
            {
                val: 60,
                text: '1 minute'
            }

        ];

        $scope.routes = [

            'control',

            'devices',

            'points',

            'data',

            'automation',

            'settings',

            'logs'

        ];

        var init = function() {

            var defaults = {

                update: 30
           
            }
       
            if (!$localStorage.navbar) {

                $localStorage.navbar = defaults;

            }

        };

        $scope.update = function() {

            var route = $localStorage.navbar.route;

            if (route == 'logs') {

                return true;

            } else {

                return false;

            }

        }
 
        init();

    }

]);