import express from 'express'
import { isLoggedIn, isNotLoggedIn } from './middlewares'
import bcrypt from 'bcrypt'
import passport from 'passport'
// import { Post } from '../models/Post'
import { User } from '../models/User'

const router: express.Router = express.Router()

router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body
  try {
    const exUser: any = await User.findOne({ where: { email } })
    if (exUser) {
      req.flash('joinError', '이미 가입된 이메일입니다.')
      return res.redirect('/join')
    }
    const hash: string = await bcrypt.hash(password, 12)
    await User.create({
      email,
      nick,
      password: hash,
    })
    return res.redirect('/')
  } catch (error) {
    console.error(error)
    return next(error)
  }
})

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError)
      return next(authError)
    }
    if (!user) {
      req.flash('loginError', info.message)
      return res.redirect('/')
    }
    return req.login(user, loginError => {
      if (loginError) {
        console.error(loginError)
        return next(loginError)
      }
      return res.redirect('/')
    })
  })(req, res, next) // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
})

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout()
  req.session?.destroy(err => {
    if (err) {
      console.error(err)
    }
  })
  res.redirect('/')
})

router.get('/kakao', passport.authenticate('kakao'))

router.get(
  '/kakao/callback',
  passport.authenticate('kakao', {
    failureRedirect: '/',
  }),
  (req, res) => {
    res.redirect('/')
  },
)

export default router
