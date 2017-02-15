var souschefApp = angular.module('souschefApp' , [
    'ngRoute',
    'souschefControllers',
]);

souschefApp.config(['$routeProvider', function($routeProvider){
    $routeProvider
    .when('/home',{
        templateUrl: 'pages/home.html',
        controller: 'homeController'
    })
    .when('/recipes',{
        templateUrl: 'pages/recipes.html',
        controller: 'RecipesController'
    })
    .when('/home/active', {
        templateUrl:'pages/home.html',
        controller:'homeController'
    })
    .when('/userpage', {
        templateUrl:'pages/userpage.html',
        controller:'userPageController'
    })
    .when('/cart', {
        templateUrl:'pages/cart.html',
        controller: 'cartController'
    })
    .when('/checkout', {
        templateUrl:'pages/checkout.html',
        controller: 'checkOutController'
    })
    .when('/reviewPurchase', {
        templateUrl:'pages/reviewPurchase.html',
        controller: 'ReviewPurchaseController'
    })
    .when('/package', {
        templateUrl:'pages/packages.html',
        controller: 'packageController'
    })
	.when('/mission', {
        templateUrl:'pages/mission.html',
		controller: 'missionQuotesController'
    })
    .when('/privacypolicy', {
        templateUrl:'pages/privacypolicy.htm'
		
    })
    .when('/terms', {
        templateUrl:'pages/terms.htm'
		
    })
    .otherwise({
        redirectTo: '/home' 
    });
}]);




