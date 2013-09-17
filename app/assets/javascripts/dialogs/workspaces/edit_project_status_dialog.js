chorus.dialogs.EditProjectStatus = chorus.dialogs.Base.include(
        chorus.Mixins.DialogFormHelpers
    ).extend({
        constructorName: "ProjectStatus",

        templateName: "edit_project_status",

        title: "Edit Project Status",

        events: {
            "submit form": "updateStatus",
            "click .submit": "updateStatus"
        },

        setup: function () {
            this.listenTo(this.resource, "saved", this.statusSaved);
            this.listenTo(this.resource, "saveFailed", this.saveFailed);
            $(document).one('reveal.facebox', _.bind(this.setupSelects, this));
        },

        setupSelects: function () {
            chorus.styleSelect(this.$("select[name='projectStatus']"));
        },

        updateStatus: function (e) {
            e.preventDefault();

            this.$("button.submit").startLoading("actions.creating");
            this.resource.save({
                projectStatus: this.$("select[name='projectStatus']").val()
            }, {wait: true});
        },

        statusSaved: function () {
            this.closeModal();
        },

        statuses: ['on_track', 'at_risk', 'needs_attention'],

        additionalContext: function () {
            return {
                options: _.map(this.statuses, function(key) {
                    return {
                        value: key,
                        nameKey: 'workspace.project.status.' + key,
                        selected: this.model.get('projectStatus') === key
                    };
                }, this)
            };
        }
    });