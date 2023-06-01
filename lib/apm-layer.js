const APMLayer = (componentCategoryCode, operationName, operationParams, componentName, boundedContext = "unknown") => {
    const layer = {
        meta: {
            component_category_code: componentCategoryCode,
            component_name: componentName,
            operation_name: operationName,
            operation_params: operationParams,
            bounded_Context: boundedContext,
            start_time: Date.now(),
            end_time: null,
            status_code: null,
        },
        success() {
            this.meta.end_time = new Date().getTime();
            this.meta.status_code = "SUCCESS"
            this.meta.http_status_code = 200;
            return this.meta;
        },

        error() {
            this.meta.end_time = new Date().getTime();
            this.meta.status_code =
                "FAIL"
            this.meta.http_status_code = 500;
            return this.meta;
        },
        done(httpStatus) {
            this.meta.end_time = new Date().getTime();
            this.meta.status_code = httpStatus;
            this.meta.http_status_code = httpStatus;
            return this.meta;
        },
        warn(httpStatus) {
            this.meta.end_time = new Date().getTime();
            this.meta.status_code = "WARN"
            this.meta.http_status_code = httpStatus;
            return this.meta;
        },
    };
    return layer;
};

module.exports = APMLayer;