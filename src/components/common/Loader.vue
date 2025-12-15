<template>
    <div class="background" :style="customStyle">
        <grid-loader :size='size' :color='color' class="loader"></grid-loader>
    </div>
    
</template>

<script>
import GridLoader from 'vue-spinner/src/GridLoader.vue';
export default {
    components: {
        GridLoader,
    },
    props: {
        customStyle: {
            type: Object,
            required: false,
        },
    },
    data() {
        return {
            size: '12px',
            color: '#9a0406',
            style: {},
        }
    },
    created() {
        this.style = this.$props.customStyle;
    }
};

</script>

<style lang="scss" scoped>
.loader {
    position: relative;
    top: 42vh;
    margin: 0 auto;
}
.background {
    height: 100vh;
    width: 100vw;
    position: fixed;
    display: block;
    top: 0;
    background: black;
    opacity: 0.7;
    z-index: 99999;
}
</style>