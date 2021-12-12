export default {
    props: {
        to: {
            type: String,
        },
        tag: {
            type: String,
            default: () => "a",
        },
    },
    computed: {
        active() {
            return this.$route.matched
                .map((item) => item.path)
                .includes(this.to);
        },
    },
    methods: {
        onClick() {
            this.$router.push(this.to);
        },
    },
    render() {
        return (
            <this.tag
                onClick={this.onClick}
                href="javascript:;"
                class={{ "router-link-active": this.active }}
            >
                {this.$slots.default}
            </this.tag>
        );
    },
};
