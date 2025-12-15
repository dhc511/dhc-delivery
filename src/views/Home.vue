<template>
  <b-row>
    <b-col>
      Delivery
    </b-col>
  </b-row>
</template>

<script>
import CustomerAPI from '@/api/customer'

export default {
  name: 'Home',

  components: {
  },

  data () {
    return {
      address: null,
    }
  },

  computed: {
  },

  mounted () {
    this.testApi()
  },

  methods: {
    /**
     * Test api
     */
    testApi () {
      CustomerAPI.getMenu().then(res => {
        console.log(res.data.data)
      }).catch(err => {
        console.log(err)
      })
    },
  }
}
</script>
