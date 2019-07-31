<template>
  <div class="home">

    <v-banner>
      <div class="banner__import">
        <i class="el-icon-wallet"></i>
        <br />
        <el-button @click="dialogFormVisible2 = true">{{$t('importAccount')}}</el-button>
      </div>
    </v-banner>

    <section class="user" v-loading="loading">
      <div v-for="(item, key) in users" :key="key" class="user__item">
        <div class="user__avatar">
          <i class="el-icon-user"></i>
        </div>
        <i @click="deleteUser(item.wallet.signingKey.address)" class="el-icon-delete"></i>
        <div class="user__name">{{item.name}}</div>
        <div class="user__money">{{item.money | accurate}}</div>
        <div class="user__token">ETH</div>
        <div class="user__address">{{item.wallet.signingKey.address}}</div>
      </div>
      <div @click="dialogFormVisible = true" class="user__item add">
        <i class="el-icon-plus"></i>
        <div>{{$t('newAccount')}}</div>
      </div>
    </section>

    <el-dialog title="创建账户" :visible.sync="dialogFormVisible">
      <el-form :model="form" :rules="rules" ref="ruleForm" :status-icon="true" label-width="80px" label-position="left">
        <el-form-item label="账户名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="设置密码" prop="pass">
          <el-input type="password" v-model="form.pass"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="form.checkPass"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="create('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="导入账户" :visible.sync="dialogFormVisible2">
      <el-form :model="form">
        <el-radio v-model="importCheck" label="1" border>私钥</el-radio>
        <el-radio v-model="importCheck" label="2" border>助记词</el-radio>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="dialogFormVisible2 = false, dialogFormVisible3 = true">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="导入账户" :visible.sync="dialogFormVisible3">
      <el-form :model="importData" :rules="importRules" ref="importRules" :status-icon="true" label-width="80px" label-position="left">
        <el-form-item :label="importCheck == '1' ? '私钥' : '助记词'" prop="key">
          <el-input type="textarea" v-model="importData.key"></el-input>
        </el-form-item>
        <el-form-item label="账户名称" prop="name">
          <el-input v-model="importData.name"></el-input>
        </el-form-item>
        <el-form-item label="设置密码" prop="pass">
          <el-input type="password" v-model="importData.pass"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkPass">
          <el-input type="password" v-model="importData.checkPass"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible3 = false">取 消</el-button>
        <el-button type="primary" @click="importUser('importRules')">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import vBanner from '../components/Banner'
import { ethers } from 'ethers'

export default {
  name: 'Home',
  components: {
    vBanner
  },
  data() {
    var validatePass = (rule, value, callback) => {
       if (value !== this.form.pass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
       if (value !== this.importData.pass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      users: [],
      loading: false,

      /*** 创建账户相关数据 ***/
      dialogFormVisible: false,
      form: {
        name: '',
        pass: '',
        checkPass: ''
      },
      rules: {
        name: { required: true, message: '请输入账户名称', trigger: 'blur' },
        pass: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '密码6-12位', trigger: 'blur' },
        ],
        checkPass: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validatePass, trigger: 'blur' }
        ]
      },
      /*** end ***/

      /*** 导入账户相关数据 ***/
      dialogFormVisible2: false,
      dialogFormVisible3: false,
      importCheck: '1',
      importData: {
        key: '',
        name: '',
        pass: '',
        checkPass: ''
      },
      importRules: {
        key: { required: true, message: '请输入key', trigger: 'blur' },
        name: { required: true, message: '请输入账户名称', trigger: 'blur' },
        pass: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 12, message: '密码6-12位', trigger: 'blur' },
        ],
        checkPass: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' }
        ]
      }
      /*** end ***/
    }
  },
  created() {
    // console.log(ethers)
    this.getUsers()
  },
  filters: {
    accurate(val) {
      return Number(val).toFixed(3)
    }
  },
  methods: {
    getUsers() {
      this.users = []
      let users = JSON.parse(localStorage.getItem('wallet'))
      
      if (!users) return
      if (!users.length) return

      this.loading = true
      users.map(async (el, idx) => {
        // let provider = ethers.getDefaultProvider()
        let provider = new ethers.providers.JsonRpcProvider('https://ropsten.infura.io/v3/2d6036eb41204013a6bf8606be3e0931', 'ropsten')
        let privateKey = el.wallet.signingKey.privateKey
        let wallet = new ethers.Wallet(privateKey, provider)

        let balance = await wallet.getBalance()
        if (balance) {
          el.money = ethers.utils.formatEther(balance)
          this.users.push(el)
          if (idx == users.length - 1) {
            this.loading = false
          }
        }
      })
    },
    create(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let wallet = ethers.Wallet.createRandom()
          this.dialogFormVisible = false
          this.save(this.form.name, this.form.pass, wallet, formName)
        }
      })
    },
    deleteUser(address) {
      this.$confirm('此操作将永久删除该账户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let index = this.users.findIndex(item => item.wallet.signingKey.address == address)
        this.users.splice(index, 1)
        localStorage.setItem('wallet', JSON.stringify(this.users))
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    importUser(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let wallet
          if (this.importCheck == '1') {
            wallet = new ethers.Wallet(this.importData.key)
          } else {
            wallet = ethers.Wallet.fromMnemonic(this.importData.key)
          }
          this.dialogFormVisible3 = false
          this.save(this.importData.name, this.importData.pass, wallet, formName)
        }
      })
    },
    save(name, pass, wallet, formName) {
      let obj = {name, pass, wallet}
      let walletCache = localStorage.getItem('wallet')
      
      if (walletCache) {
        let walletArr = JSON.parse(walletCache)

        let repeat = walletArr.find(i => i.wallet.signingKey.address == wallet.signingKey.address)
        if (repeat) {
          this.$message.error('账户重复')
          return
        }

        walletArr.push(obj)
        localStorage.setItem('wallet', JSON.stringify(walletArr))
      } else {
        localStorage.setItem('wallet', JSON.stringify([obj]))
      }

      this.$notify({
        title: '创建成功',
        message: '秘钥：' + wallet.signingKey.privateKey,
        type: 'success',
        duration: 0
      })
      this.getUsers()
      this.$refs[formName].resetFields()
    }
  }
};
</script>

<style lang="scss" scoped>
.banner {
  &__import {
    text-align: center;

    .el-icon-wallet {
      margin-bottom: 10px;
      font-size: 100px;
      color: #fff;
    }
  }
}

.user {
  display: flex;
  flex-wrap: wrap;
  align-content: space-around;
  width: 1350px;
  margin: 100px auto 50px;
  padding: 45px 15px 0;

  &__item {
    position: relative;
    padding-top: 55px;
    margin: 10px;
    margin-bottom: 50px;
    width: 250px;
    height: 200px;
    background: #fff;
    box-sizing: border-box;
    text-align: center;
    .el-icon-delete {
      position: absolute;
      top: 10px;
      right: 10px;
      color: #9ea1a2;
      cursor: pointer;
    }
    &.add {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      padding: 0;
      cursor: pointer;
      .el-icon-plus {
        margin-bottom: 5px;
        font-size: 50px;
        font-weight: bolder;
        color: #999c9d;
      }
    }
  }
  &__avatar {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: -43.3px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 86.6px;
    background-color: #4d4b91;
    &::before {
      content: "";
      display: block;
      position: absolute;
      width: 0;
      height: 0;
      right: 50px;
      border-width: 43.3px 25px;
      border-style: solid;
      border-color: transparent #4d4b91 transparent transparent;
    }
    &::after {
      content: "";
      display: block;
      position: absolute;
      width: 0;
      height: 0;
      left: 50px;
      border-width: 43.3px 25px;
      border-style: solid;
      border-color: transparent transparent transparent #4d4b91;
      top: 0;
    }
    .el-icon-user {
      font-size: 50px;
      color: #fff;
    }
  }
  &__name {
    color: #274154;
  }
  &__money {
    font-size: 20px;
    color: #2e295e;
  }
  &__address {
    margin-top: 10px;
    padding: 0 50px;
    font-size: 12px;
    color: #9ea1a2;
    word-break: break-word;
  }
}
</style>
<style lang="scss">
.el-notification {
  &__content {
    text-align: left;
    p {
      word-break: break-all;
    }
  }
}
.el-dialog {
  width: 550px !important;

  &__body {
    text-align: center;
  }
}
</style>
