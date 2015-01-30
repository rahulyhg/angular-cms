'use strict';

/* controller for pages */
angular.module('cms.controllers')
    .controller('pageCtrl', ['genService', 'MenuService', '$scope', '$timeout', function (genService, MenuService, $scope, $timeout) {
        // set Menu according to its Name
        MenuService.update("Artikel");

        $scope.apiPath   = 'pages'; // used for genService
        $scope.deleteMsg = 'Löschen';

        $scope.loadingPages = true;
        genService.getAllObjects('pages').then(function (response) {
            $scope.pages = response;
            $timeout(function () {
                $scope.loadingPages = false;
            }, 300);
        });
    }])
    .controller('pageDetailCtrl', ['genService', 'MenuService', '$scope', '$routeParams', '$timeout', '$location', 'toaster', function (genService, MenuService, $scope, $routeParams, $timeout, $location, toaster) {
        // cancel this promise on route change
        var redirectTimeoutPromise,
            selectedArticleIds = [],
            i = 0;

        // set Menu according to its Name
        MenuService.update("Artikel");

        $scope.apiPath   = 'pages';
        $scope.menuName  = 'Seite bearbeiten';
        $scope.deleteMsg = 'Löschen';

        genService.getObjectById('pages', $routeParams.pageId).then(function (response) {
            // redirect to overview in case page doesn't exist
            if (!response) {
                toaster.pop('error', null, 'Uups. Die angeforderte Seite exisitert nicht (mehr).');
                $location.path("/pages");
            }
            $scope.page             = response;

            for (i = 0; i < $scope.page.articles.length; i++) {
                selectedArticleIds.push($scope.page.articles[i].id);
            }

            // show locked message if page is locked
            $scope.$parent.isLocked = $scope.page.is_locked ? true : false;
            $scope.$parent.isLockedMessage  = 'Deine Seite wird momentan bearbeitet. Trotzdem weiterfahren?';
        });

        genService.getAllObjects('languages').then(function (response) {
            $scope.allLanguages = response;
        });

        genService.getAllObjects('pageCategories').then(function (response) {
            $scope.allPageCategories = response;
        });

        genService.getAllObjects('articles').then(function (response) {
            $scope.allArticles = [];
            for (i = 0; i < response.length; i++) {
                if (selectedArticleIds.indexOf(response[i].id) === -1) {
                    $scope.allArticles.push(response[i]);
                }
            }
        });

        $scope.removeArticleFromPage = function (pArticleId) {
            var idx = 0;

            for (i = 0; i < $scope.page.articles.length; i++) {
                if ($scope.page.articles[i].id === pArticleId) {
                    idx = i;
                    break;
                }
            }

            // remove element
            var removedArticle = $scope.page.articles.splice(idx, 1);
            $scope.allArticles.push(removedArticle[0]);
        };

        $scope.addArticleToPage = function (pArticleId) {
            var idx = 0;

            for (i = 0; i < $scope.allArticles.length; i++) {
                if ($scope.allArticles[i].id === pArticleId) {
                    idx = i;
                    break;
                }
            }

            // remove element
            var removedArticle = $scope.allArticles.splice(idx, 1);
            $scope.page.articles.push(removedArticle[0]);
        };

        // save changes in page
        $scope.savePage = function (pPage) {
            var idx = 0;

            if (!pPage.title) {
                toaster.pop('warning', "Titel", "Der Titel für die Seite muss angegeben werden");
                return;
            }

            // Unfortunately angular supports only strings in model
            // -> parse category and language to JSON if string
            // -> http://stackoverflow.com/questions/14832405/angularjs-ng-model-converts-object-to-string
            for (idx in pPage.articles) {
                if (pPage.articles.hasOwnProperty(idx)) {
                    if (angular.isString(pPage.articles[idx])) {
                        // value false indicates a deselection of an article
                        pPage.articles[idx] = JSON.parse(pPage.articles[idx]);
                    }
                }
            }

            if (angular.isString(pPage.language)) {
                pPage.language = JSON.parse(pPage.language);
            }

            if (angular.isString(pPage.category)) {
                pPage.category = JSON.parse(pPage.category);
            }

            $scope.loading = true;
            genService.updateObject('pages', pPage).then(function () {
                toaster.pop('success', null, "Menüseite wurde aktualisiert");
                redirectTimeoutPromise = $timeout(function () {
                    $location.path('/pages');
                    $scope.loading = false;
                }, 2500);
            });
        };

        // cancel redirect promises on route change
        $scope.$on('$locationChangeStart', function () {
            $timeout.cancel(redirectTimeoutPromise);
        });
    }])
    .controller('pageAddCtrl', ['genService', 'MenuService', '$scope', '$location', '$timeout', 'toaster', function (genService, MenuService, $scope, $location, $timeout, toaster) {
        // set Menu according to its Name
        MenuService.update("Artikel");

        // cancel this promise on route change
        var redirectTimeoutPromise,
            selectedArticleIds = [],
            i = 0;

        $scope.apiPath   = 'pages';
        $scope.menuName  = 'Seite hinzufügen';

        genService.getEmptyObject('page').then(function (response) {
            // redirect to overview in case page doesn't exist
            if (!response) {
                toaster.pop('error', null, 'Uups. Die angeforderte Seite exisitert nicht (mehr).');
                $location.path("/pages");
            }
            $scope.page             = response;

            for (i = 0; i < $scope.page.articles.length; i++) {
                selectedArticleIds.push($scope.page.articles[i].id);
            }

            // show locked message if page is locked
            $scope.$parent.isLocked = $scope.page.is_locked ? true : false;
            $scope.$parent.isLockedMessage  = 'Deine Seite wird momentan bearbeitet. Trotzdem weiterfahren?';
        });

        genService.getAllObjects('languages').then(function (response) {
            $scope.allLanguages = response;
        });

        genService.getAllObjects('pageCategories').then(function (response) {
            $scope.allPageCategories = response;
        });

        genService.getAllObjects('articles').then(function (response) {
            $scope.allArticles = [];
            for (i = 0; i < response.length; i++) {
                if (selectedArticleIds.indexOf(response[i].id) === -1) {
                    $scope.allArticles.push(response[i]);
                }
            }
        });

        $scope.removeArticleFromPage = function (pArticleId) {
            var idx = 0;

            for (i = 0; i < $scope.page.articles.length; i++) {
                if ($scope.page.articles[i].id === pArticleId) {
                    idx = i;
                    break;
                }
            }

            // remove element
            var removedArticle = $scope.page.articles.splice(idx, 1);
            $scope.allArticles.push(removedArticle[0]);
        };

        $scope.addArticleToPage = function (pArticleId) {
            var idx = 0;

            for (i = 0; i < $scope.allArticles.length; i++) {
                if ($scope.allArticles[i].id === pArticleId) {
                    idx = i;
                    break;
                }
            }

            // remove element
            var removedArticle = $scope.allArticles.splice(idx, 1);
            $scope.page.articles.push(removedArticle[0]);
        };

        // save changes in page
        $scope.savePage = function (pPage) {
            if (!pPage.title) {
                toaster.pop('warning', "Titel", "Der Titel für die Seite muss angegeben werden");
                return;
            }

            // Unfortunately angular supports only strings in model
            // -> parse category and language to JSON if string
            // -> http://stackoverflow.com/questions/14832405/angularjs-ng-model-converts-object-to-string
            if (angular.isString(pPage.language)) {
                pPage.language = JSON.parse(pPage.language);
            }

            if (angular.isString(pPage.category)) {
                pPage.category = JSON.parse(pPage.category);
            }

            $scope.loading = true;
            genService.insertObject('pages', pPage).then(function () {
                toaster.pop('success', null, "Menüseite wurde hinzugefügt");
                redirectTimeoutPromise = $timeout(function () {
                    $location.path('/pages');
                    $scope.loading = false;
                }, 2500);
            });
        };

        // cancel redirect promises on route change
        $scope.$on('$locationChangeStart', function () {
            $timeout.cancel(redirectTimeoutPromise);
        });
    }]);