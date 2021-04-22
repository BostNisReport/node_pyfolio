(function (root) {
    

    angular.module('GoogleTreeModule', []).controller('GoogleTreeController', ['$scope', GoogleTreeController_Controller]);

    function GoogleTreeController_Controller($scope, $element, $compile) {
  
        angular.ready(function () {
            $scope.setReady();
        });

      
    }


})(this)