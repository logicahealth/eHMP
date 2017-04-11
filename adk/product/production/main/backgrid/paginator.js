define([
    'backbone',
    'marionette',
    'jquery',
    'underscore',
    'backgrid',
    'backgrid.paginator'
], function(Backbone, Marionette, $, _, Backgrid) {
    'use strict';
    var Paginator = {};

    Paginator.create = function(options) {
        var PageHandle = Backgrid.Extension.PageHandle.extend({
            events: {
              'click .nextPaginator': 'focusPaginator',
              'click .previousPaginator': 'focusPaginator'
            },
            focusPaginator: function(event) {
              var parent = this.$el.closest('.backgrid-paginator');
              var button = $(event.currentTarget);
              this.changePage(event);
              if (button.hasClass('nextPaginator')) {
                button = parent.find('button.nextPaginator');
              } else {
                button = parent.find('button.previousPaginator');
              }
              if (button.prop("disabled")) {
                if(button.hasClass('nextPaginator')) {
                  button = parent.find('button.previousPaginator');
                } else {
                  button = parent.find('button.nextPaginator');
                }
              }
              button.focus();
            },
            render: function (vars) {
              this.$el.empty();
              var elem;
              if(this.title !== 'Next' && this.title !== 'Previous'){
                if (this.label === this.collection.state.currentPage.toString()) {
                  elem = document.createElement("span");
                  elem.title = this.title + ' of ' + this.collection.state.totalPages;
                  elem.innerHTML = this.label + ' of ' + this.collection.state.totalPages;
                }
              }else {
                elem = document.createElement("button");
                elem.type = 'button';
                if (this.title === 'Next') {
                  elem.className = 'btn btn-icon nextPaginator';
                  if(this.collection.state.currentPage !== this.collection.state.totalPages) {
                    elem.title = 'Press enter to load the next page, page ' + (this.collection.state.currentPage + 1) + ', and then press ALT + R to view the table';
                  } else {
                    elem.title = 'This is the last page.';
                  }
                  elem.innerHTML = '<i class="fa fa-chevron-right fa-lg"></i>';
                } else if (this.title === 'Previous') {
                  elem.className = 'btn btn-icon previousPaginator left-margin-xs';
                  if((this.collection.state.currentPage - 1) !== 0) {
                    elem.title = 'Press enter to load the previous page, page' + (this.collection.state.currentPage - 1) + ', and then press ALT + R to view the table';
                  } else {
                    elem.title = 'This is the first page.';
                  }
                  elem.innerHTML = '<i class="fa fa-chevron-left fa-lg"></i>';
                }
              }
              if (!_.isUndefined(elem)) {
                this.el.appendChild(elem);
              }

              var collection = this.collection;
              var state = collection.state;
              var currentPage = state.currentPage;
              var pageIndex = this.pageIndex;

              if (this.isRewind && currentPage == state.firstPage ||
                 this.isBack && !collection.hasPreviousPage() ||
                 this.isForward && !collection.hasNextPage() ||
                 this.isFastForward && (currentPage == state.lastPage || state.totalPages < 1)) {
                this.$el.addClass("disabled");
                this.$el.children('button').prop("disabled", true);
              }
              else if (!(this.isRewind ||
                         this.isBack ||
                         this.isForward ||
                         this.isFastForward) &&
                       state.currentPage == pageIndex) {
                this.$el.addClass("active");
                this.$el.children('button').prop("disabled", false);
              }

              this.delegateEvents();
              return this;
            }
        });

        var paginatorOptions = {
            slideScale: 0,
            pageHandle: PageHandle
        };
        _.extend(paginatorOptions, options);
        var paginatorView = new Backgrid.Extension.Paginator(paginatorOptions);
        return paginatorView;
    };

    return Paginator;
});