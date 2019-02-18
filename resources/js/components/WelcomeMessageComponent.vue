<template>
    <div class="welcomeMessage" v-bind:title="message">
        {{ msg }}
        <br/>
        <strong>{{ msg }}</strong>
    </div>
</template>
<script>
    export default {
        mounted() {
            console.log('welcomemsg component mounted.')
        }
    }
</script>
