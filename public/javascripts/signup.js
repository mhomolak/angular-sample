(function() {
  'use strict';

  angular.module('app')
    .controller('SignupController', function ($scope, $http, $window, $location,
    $rootScope) {

      $scope.createUser = function() {

        $http.post('/api/v1/users/signup', $scope.user)
          .then(function (response) {
            $rootScope.user = response.data;
            $window.localStorage.setItem('token', response.data.token);
            $location.path('/');
        })

        // √ $http post /api/v1/users/signup
        // √ then
          // store token
          // redirect
        // catch
          //
      }

    })

}());
