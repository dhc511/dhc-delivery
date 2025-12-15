export default {
    computed: {
        messageBoxOK() {
            return {
                size: 'sm',
                buttonSize: 'lg',
                centered: true,
                okVariant: 'danger',
                footerClass: 'p-2',
            };
        },
        messageBoxOKsizeXXL() {
            return {
                size: 'lg',
                buttonSize: 'lg',
                centered: true,
                okVariant: 'danger',
                footerClass: 'p-2',
            };
        },
        messageBoxAttention() {
            return {
                size: 'lg',
                buttonSize: 'lg',
                centered: true,
                okVariant: 'danger',
                footerClass: 'p-2',
            };
        },
        messageBoxRegisterOK(){
            return {
                size: 'sm',
                buttonSize: 'lg',
                centered: true,
                okVariant: 'danger',
                okTitle: this.$t('button.proceed'),
                footerClass: 'p-2',
            };
        },
        messageBoxConfirm() {
            return {
                size: 'sm',
                buttonSize: 'lg',
                centered: true,
                noCloseOnBackdrop: true,
                okVariant: 'danger',
                okTitle: this.$t('button.ok'),
                cancelTitle: this.$t('button.cancel'),
                footerClass: 'p-2',
            };
        },
    }
}