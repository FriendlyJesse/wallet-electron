<template>
  <div class="contact">
    <v-banner>
      <div class="banner__text">
        {{$t('contact')}}
      </div>
    </v-banner>
    
    <section class="user">
      <div v-for="(item, key) in contacts" :key="key" class="user__item">
        <div class="user__avatar">
          <i class="el-icon-user"></i>
        </div>
        <i @click="deleteContact(item.address)" class="el-icon-delete"></i>
        <div class="user__name">{{item.name}}</div>
        <div class="user__address">{{item.address}}</div>
      </div>
      <div @click="dialogFormVisible = true" class="user__item add">
        <i class="el-icon-plus"></i>
        <div>{{$t('newContact')}}</div>
      </div>
    </section>

    <el-dialog title="输入联系人信息" :visible.sync="dialogFormVisible">
      <el-form :model="form" :rules="rules" ref="ruleForm" :status-icon="true" label-width="80px" label-position="left">
        <el-form-item label="账户名称" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="账户地址" prop="address">
          <el-input v-model="form.address"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="create('ruleForm')">确 定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import vBanner from '../components/Banner'

export default {
  name: 'Contact',
  components: {
    vBanner
  },
  data() {
    return {
      contacts: [],
      dialogFormVisible: false,
      form: {
        name: '',
        address: ''
      },
      rules: {
        name: { required: true, message: '请输入名称', trigger: 'blur' },
        address: { required: true, message: '请输入地址', trigger: 'blur' }
      }
    }
  },
  created() {
    this.getContacts()
  },
  methods: {
    getContacts() {
      this.contacts = []
      let contacts = JSON.parse(localStorage.getItem('contacts'))
      
      if (!contacts) return
      if (!contacts.length) return

      this.contacts = contacts
    },
    create(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          
          let contactCache = localStorage.getItem('contacts')
          
          if (contactCache) {
            let contactArr = JSON.parse(contactCache)

            let repeat = contactArr.find(i => i.address == this.form.address)
            if (repeat) {
              this.$message.error('账户重复')
              return
            }

            contactArr.push(this.form)
            localStorage.setItem('contacts', JSON.stringify(contactArr))
          } else {
            localStorage.setItem('contacts', JSON.stringify([this.form]))
          }

          this.dialogFormVisible = false
          this.$notify({
            title: '创建成功',
            message: '地址：' + this.form.address,
            type: 'success'
          })
          this.getContacts()
          this.$refs[formName].resetFields()
        }
      })
    },
    deleteContact(address) {
      this.$confirm('此操作将永久删除该账户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let index = this.contacts.findIndex(item => item.address == address)
        this.contacts.splice(index, 1)
        localStorage.setItem('contacts', JSON.stringify(this.contacts))
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
    }
  }
}
</script>

<style lang="scss" scoped>
.user {
  display: flex;
  flex-wrap: wrap;
  align-content: space-around;
  width: 1350px;
  margin: 100px auto 0;
  padding: 0 15px;

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
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #4d4b91;
    
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