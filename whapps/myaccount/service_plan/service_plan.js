winkstart.module('myaccount', 'service_plan', {
        css: [
           'css/service_plan.css'
        ],

        templates: {
           menu: 'tmpl/menu.handlebars',
           service_plan: 'tmpl/service_plan.handlebars'
        },

        locales: ['en', 'fr'],

        subscribe: {
            'myaccount.loaded': 'myaccount_loaded',
            'myaccount.service_plan.render': 'render'
        },

        resources: {
            'service_plan.get': {
                url: '{api_url}/accounts/{account_id}/service_plans/current',
                verb: 'GET'
            },
            'service_plan.download_csv_test': {
                url: '{api_url}/accounts/{account_id}/service_plans/current',
                headers: { 'Accept': 'text/csv' },
                verb: 'GET'
            }
        }
    },

    function(args) {
        var THIS = this;

        winkstart.registerResources(THIS.__whapp, THIS.config.resources);
    },
    {
        download_csv: function(success, error) {
            var THIS = this;
            winkstart.request('service_plan.download_csv_test', {
                    account_id: winkstart.apps['myaccount'].account_id,
                    api_url: winkstart.apps['myaccount'].api_url
                },
                function(data, status) {
                    if(typeof success == 'function') {
                        success(data, status);
                    }
                },
                function(data, status) {
                    if(typeof error == 'function') {
                        error(data, status);
                    }
                }
            );
        },

        service_plan_get: function(success, error) {
            var THIS = this;
            winkstart.request('service_plan.get', {
                    account_id: winkstart.apps['myaccount'].account_id,
                    api_url: winkstart.apps['myaccount'].api_url
                },
                function(data, status) {
                    if(typeof success == 'function') {
                        success(data, status);
                    }
                },
                function(data, status) {
                    if(typeof error == 'function') {
                        error(data, status);
                    }
                }
            );
        },

        render: function() {
            console.log('dsa');
            var THIS = this;

            THIS.service_plan_get(function(data) {
                var data_array = [],
                    total_amount = 0;

                if('items' in data.data) {
                    $.each(data.data.items, function(category_name, category) {
                        $.each(category, function(item_name, item) {
                            var monthly_charges = (item.rate * item.quantity) || 0;

                            if(monthly_charges > 0) {
                                data_array.push({
                                    service: item_name,
                                    rate: item.rate || 0,
                                    quantity: item.quantity || 0,
                                    monthly_charges: monthly_charges
                                });

                                total_amount += monthly_charges;
                            }
                        });
                    });
                }

                var sort_by_price = function(a, b) {
                    return ((a.monthly_charges >= b.monthly_charges) ? -1 : 1);
                }

                data_array.sort(sort_by_price);

                var $service_plan_html = THIS.templates.service_plan.tmpl({ service_plan_array: data_array, total_amount: parseFloat(total_amount).toFixed(2) });

                $('.icon-question-sign[data-toggle="tooltip"]', $service_plan_html).tooltip();

                $('#get_csv', $service_plan_html).on('click', function() {
                    THIS.download_csv(function(data) {
                    });
                });

                winkstart.publish('myaccount.render_submodule', $service_plan_html);
            });

        },

        myaccount_loaded: function($myaccount_html) {
            var THIS = this,
                $service_plan_menu_html = THIS.templates.menu.tmpl({});

            winkstart.publish('myaccount.add_submodule', $service_plan_menu_html, 30, 'billing_category');
        }
    }
);
