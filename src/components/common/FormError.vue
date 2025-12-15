<template>
  <div class="form__error">{{message}}</div>
</template>

<script>
export default {
  props: ["message"]
};
</script>
<style lang="scss" scoped>
// @import "@/assets/styles/main.scss";
.form__error {
  color: $danger;
  font-size: 1.2rem;
  text-align: left;
}
</style>