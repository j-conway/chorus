chorus.dialogs.InstancesNew = chorus.dialogs.Base.extend({
    constructorName: "InstancesNew",
    templateName:"instance_new",
    title:t("instances.new_dialog.title"),
    persistent:true,

    events:{
        "change select.data_sources":"showFieldset",
        "click button.submit": "createInstance",
        "click a.close_errors": "clearServerErrors"
    },

    setup:function () {
        this.aurora = chorus.models.GpdbInstance.aurora();
        this.aurora.fetch();

        this.requiredResources.add(chorus.models.Config.instance());
        this.requiredResources.add(this.aurora);
    },

    postRender: function() {
        if (this.aurora.isInstalled()) {
            this.loadTemplates();
        }

        _.defer(_.bind(function() {
            chorus.styleSelect(this.$("select.data_sources"), { format: function(text, option) {
                var aliasedName = $(option).attr("name");
                    return '<span class='+ aliasedName +'></span>' + text;
            } });
        }, this));
    },

    loadTemplates: function() {
        var templates = this.aurora.getTemplates();

        var $select = $("<select/>").attr('name', 'template').
                                     addClass('instance_size');

        _.each(templates, function(template) {
            var $option = $("<option/>").val(template.name()).text(template.toText());
            $select.append($option);
        });

        this.$(".instance_size_container").append($select);
        chorus.styleSelect(this.$("select.instance_size"), { menuWidth: 200 });
    },

    makeModel:function () {
        this.model = this.model || new chorus.models.GpdbInstance();
    },

    additionalContext: function() {
        return {
            auroraInstalled: chorus.models.GpdbInstance.aurora().isInstalled(),
            provisionMaxSizeInGB: chorus.models.Config.instance().get("provisionMaxSizeInGb"),
            gnipConfigured:  chorus.models.Config.instance().get('gnipConfigured')
        };
    },

    showFieldset:function (e) {
        this.$(".data_sources_form").addClass("collapsed");
        var className = $(e.currentTarget).val();

        if(className.length) {
            this.$("." + className).removeClass("collapsed");
        }
        this.$("button.submit").prop("disabled", className.length === 0);
        this.clearErrors();
    },

    createInstance:function (e) {
        e && e.preventDefault();

        this.resource = this.model = new (this.instanceClass())();
        this.bindings.add(this.model, "saved", this.saveSuccess);
        this.bindings.add(this.model, "saveFailed", this.saveFailed);
        this.bindings.add(this.model, "validationFailed", this.saveFailed);

        this.$("button.submit").startLoading("instances.new_dialog.saving");
        var values = this.fieldValues();
        this.model.save(values);
    },

    instanceClass: function() {
        var instanceType = this.$("select.data_sources").val();
        if (instanceType === "register_existing_hadoop") {
            return chorus.models.HadoopInstance;
        } else if (instanceType === "register_existing_gnip") {
            return chorus.models.GnipInstance;
        } else {
            return chorus.models.GpdbInstance;
        }
    },

    fieldValues: function() {
        var updates = {};
        var className = this.$("select.data_sources").val();
        var inputSource = this.$("." + className);
        _.each(inputSource.find("input[type=text], input[type=hidden], input[type=password], textarea, select"), function (i) {
            var input = $(i);
            updates[input.attr("name")] = input.val().trim();
        });

        updates.shared = inputSource.find("input[name=shared]").prop("checked") ? "true" : "false";
        return updates;
    },

    clearServerErrors : function() {
        this.model.serverErrors = {};
    },

    saveSuccess:function () {
        chorus.PageEvents.broadcast("instance:added", this.model);

        if (this.model.get("provision_type") === "create") {
            this.provisioning = true;
            chorus.toast("instances.new_dialog.provisioning");
            chorus.router.navigate("/instances", { selectId: this.model.get("id") });

        }

        this.closeModal();
    },

    saveFailed:function () {
        this.$("button.submit").stopLoading();
        this.showErrors();
    }
});

