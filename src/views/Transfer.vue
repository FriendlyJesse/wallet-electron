<template>
  <div class="transfer">

    <v-banner>
      <div class="banner__text">
        {{$t('transfer')}}
      </div>
    </v-banner>
    
    <section class="form" v-loading="loading">
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" class="demo-ruleForm">
        <el-form-item label="转出" prop="transferOut">
          <el-select @change="selectAccount(ruleForm.transferOut)" v-model="ruleForm.transferOut" filterable placeholder="请选择账户">
            <el-option
              v-for="(item, key) in users"
              :key="key"
              :label="item.name"
              :value="item.wallet.signingKey.address">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转入" prop="transferIn">
          <el-autocomplete
            class="inline-input"
            v-model="ruleForm.transferIn"
            :fetch-suggestions="querySearch"
            @select="handleSelect"
            placeholder="请输入转入地址"
            clearable
          ></el-autocomplete>
          <!-- <el-input placeholder="请输入转入地址" :fetch-suggestions="querySearch" v-model="ruleForm.transferIn" clearable suffix-icon="el-icon-notebook-1"></el-input> -->
        </el-form-item>
        <el-form-item label="ETH" prop="money">
          <el-input class="money" type="number" placeholder="请输入ETH" v-model="ruleForm.money" clearable></el-input>
          <el-switch
            v-model="all"
            @change="checkAll"
            active-text="全部"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="ruleForm.desc"></el-input>
        </el-form-item>
        <el-form-item label="手续费">
          <el-slider v-model="ruleForm.handlingFee"></el-slider>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">确认</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

  </div>
</template>

<script>
import vBanner from '../components/Banner'
import { ethers } from 'ethers'

export default {
  name: 'Transfer',
  components: {
    vBanner
  },
  data() {
    let moneyRuler = (rule, value, callback) => {
      if (value <= 0) {
        callback(new Error('金额不能小于等于0'))
      } else {
        callback()
      }
    }

    return {
      wallet: {},
      users: [],
      contacts: [],
      all: false,
      balance: '',
      loading: false,
      ruleForm: {
        transferOut: '',
        transferIn: '',
        money: '',
        desc: '',
        handlingFee: 1
      },
      rules: {
        transferOut: { required: true, message: '请输入转出地址', trigger: 'blur' },
        transferIn: { required: true, message: '请输入转入地址', trigger: 'change' },
        money: [
          { required: true, message: '请输入ETH', trigger: 'blur' },
          { validator: moneyRuler, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      let users = localStorage.getItem('wallet')
      let contacts = localStorage.getItem('contacts')
      if (users) {
        this.users = JSON.parse(users)
      }
      if (contacts) {
        // 处理联系人数据
        let parseContacts = JSON.parse(contacts)
        parseContacts.map(i => {
          i.value = i.name
        })
        this.contacts = parseContacts
      }
    },
    async selectAccount(address) {
      let account = this.users.find(i => i.wallet.signingKey.address == address)

      this.loading = true

      // 链接钱包
      let provider = new ethers.providers.JsonRpcProvider('https://ropsten.infura.io/v3/2d6036eb41204013a6bf8606be3e0931', 'ropsten')
      let privateKey = account.wallet.signingKey.privateKey
      this.wallet = new ethers.Wallet(privateKey, provider)

      // 获取eth
      this.balance = ethers.utils.formatEther(await this.wallet.getBalance())

      this.loading = false
    },
    querySearch(queryString, cb) {
      cb(this.contacts)
    },
    handleSelect() {
      let contact = this.contacts.find(i => i.value == this.ruleForm.transferIn)
      this.ruleForm.transferIn = contact.address
    },
    checkAll() {
      this.ruleForm.money = this.all ? this.balance : ''
    },
     submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {

          this.$confirm('此操作将提交转账, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(async () => {
            
            // 转账代码
            let tx = {
              to: this.ruleForm.transferIn,
              value: ethers.utils.parseEther(this.ruleForm.money)
            }

            let res = await this.wallet.sendTransaction(tx)
            if (res) {
              this.$notify({
                title: '转账成功',
                message: '转账给：' + this.ruleForm.transferIn,
                type: 'success'
              })
              this.$refs[formName].resetFields()
            } else {
              this.$notify({
                title: '转账失败',
                message: '转账给：' + this.ruleForm.transferIn,
                type: 'error'
              })
            }

          }).catch(() => {
            this.$message({
              type: 'info',
              message: '已取消转账'
            })         
          })
          
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.form {
  padding: 50px 30px;
  width: 650px;
  margin: 50px auto;
  border-radius: 5px;
  background: #fff;

  /deep/ .el-form {
    width: 500px;
    margin: 0 auto;

    &-item {
      width: 450px;
    }
  }
  /deep/ .el-input, /deep/ .el-textarea {
    width: 345px;
    &.money {
      margin-right: 30px;
      width: 240px;
    }
  }
}
</style>