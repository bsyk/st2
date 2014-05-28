'use strict';
angular.module('main')
  .controller('sk0ReactCtrl', function ($scope) {
    // We need to define it here to allocate this variable in a prototype chain for other controllers.
    $scope.rule = {};

    $scope.setRule = function (rule) {
      $scope.rule = rule || {};
    };
  })
  .controller('sk0ReactListCtrl', function ($scope, $resource) {
    var Rules = $resource('http://kandra.apiary-mock.com/rules?expand=true');

    $scope.rules = Rules.query();
  })
  .controller('sk0ReactPickCtrl', function ($scope, $resource, $state) {
    var Services = $resource('http://kandra.apiary-mock.com/categories');

    $scope.services = Services.get();

    $scope.type = $state.current.data.type;
    $scope.rule[$scope.type] = $scope.rule[$scope.type] || {};

    $scope.pick = function (entity) {
      $scope.rule[$scope.type].type = entity;
      $state.go('.setup', { type: $scope.type });
    };
  })
  .controller('sk0ReactSetupCtrl', function ($scope, $state, $stateParams) {
    $scope.type = $stateParams.type;
    $scope.formResults = _.clone($scope.rule[$scope.type].options) || {};

    $scope.formFields = [
      {
        key: 'text',
        type: 'text',
        label: 'Text',
        placeholder: 'some text',
        description: 'Text to show on the constructor'
      }
    ];

    $scope.submit = function () {
      $scope.rule[$scope.type].options = $scope.formResults;
      $state.go($scope.rule.trigger && $scope.rule.action ? 'react.test' : 'react.list');
    };
  })
  .controller('sk0ReactTestCtrl', function ($scope, $resource, $state) {
    var Rules = $resource('http://:baseURL/rules?expand=true', {
      baseURL: 'kandra.apiary-mock.com'
    }, {
      confirm: { url: 'http://:baseURL/rules/:id/confirm' },
      log: { url: 'http://:baseURL/rules/:id/log', isArray: true }
    });

    $scope.result = Rules.save({
      trigger: {
        type: $scope.rule.trigger.type.name,
        options: $scope.rule.trigger.options
      },
      action: {
        type: $scope.rule.action.type.name,
        options: $scope.rule.action.options
      }
    });

    $scope.result.$promise.then(function (rule) {
      var timer = setInterval(function () {

        Rules.log({ id: rule.id }, function (logs) {
          $scope.logs = logs[logs.length - 1];

          if ($scope.isPassed('trigger') !== undefined && $scope.isPassed('action') !== undefined) {
            clearInterval(timer);
          }
        });
      }, 3000);
    });

    $scope.isPassed = function (type) {
      return $scope.logs && $scope.logs[type].response && ($scope.logs[type].response.err ? false : true);
    };

    $scope.cancel = function () {
      $scope.setRule();
      $state.go('^.list');
    };

    $scope.save = function () {
      $scope.result.$promise.then(function (rule) {
        console.log(rule);
        rule.$confirm({ id: rule.id }, function () {
          $scope.setRule();
          $state.go('^.list');
        });
      });
    };

    console.log(Rules);
  });