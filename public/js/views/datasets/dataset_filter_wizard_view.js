chorus.views.DatasetFilterWizard = chorus.views.Base.extend({
    className: "dataset_filter_wizard",
    events : {
        "click .add_filter" : "addFilterAndRender"
    },

    setup : function() {
        this.filterViews = [];
    },

    postRender : function() {
        var $ul = this.$(".filters");
        if (!this.filterViews.length) {
            this.addFilter();
        }

        _.each(this.filterViews, function(filterView){
            $ul.append(filterView.el);
            filterView.render();
            filterView.delegateEvents();
        });

        this.tagLastLi();
    },

    addFilter : function() {
        var filterView = new chorus.views.DatasetFilter({collection: this.collection});
        filterView.render();
        filterView.owner = this;

        filterView.bindOnce("filterview:deleted", this.removeFilterView, this);
        this.filterViews.push(filterView);
    },

    addFilterAndRender : function(e) {
        e && e.preventDefault();
        this.addFilter();
        this.$(".filters").append(_.last(this.filterViews).el);
        this.tagLastLi();
    },

    removeFilterView : function(view) {
        this.filterViews = _.without(this.filterViews, view);
        $(view.el).remove();
        this.tagLastLi();
    },

    tagLastLi : function() {
        var $ul = this.$(".filters");
        $ul.find("li").removeClass("last");
        $ul.find("li:last-child").addClass("last");
    },

    whereClause : function() {
        var wheres = _.map(this.filterViews, function(filterView){
            return filterView.filterString();
        });

        return wheres.length ? ("WHERE " + wheres.join(" AND ")) : "";
    }
});