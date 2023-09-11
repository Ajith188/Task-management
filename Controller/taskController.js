const router = require("express").Router()
const task = require("../Model/taskModel")
const sendMail = require("../utils/sendEmail")
const { imageUpload } = require("../middleware/imageUpload")
const cron = require("node-cron")
const moment = require("moment")
const isValidObjectId = require("../middleware/objectIdErrorHandling")
const mongoose = require("mongoose")
const timing = require("../Model/TimingModel")

router.post("/taskCreation", imageUpload.array("images"), async (req, res) => {
  try {
    const taskName = (req.body.title).toLowerCase().trim()
    const existTask = await task.find({ title: taskName, userId: req.user.userId, isDeleted: false })
    if (existTask.length == 0) {
      if (req.files.length > 0) {
        const imageArray = []
        req.files.forEach((i) => {
          imageArray.push(`${process.env.API_URL}/uploads/${i.filename}`)
        })
        req.body.images = imageArray
      }
      else {
        req.body.images = []
      }
      req.body.title = taskName
      req.body.userId = req.user.userId
      req.body.userEmail = req.user.email
      req.body.month = moment(new Date(req.body.assignedDate)).format("YYYY-MM")
      const data = await task.create(req.body)
      if (data != null) {
        res.status(200).json({ status: true, message: "Task created successfully!", data })
      }
      else {
        res.status(302).json({ status: false, message: "failed to create" })
      }
    }
    else {
      res.status(302).json({ status: false, message: "Title name already exists" })
    }
  }
  catch (err) {
    res.status(500).json({ status: false, message: "Internal Server error" })
  }
})

router.get("/getAllTask", async (req, res) => {
  try {
    const data = await task.find({ userId: req.user.userId, isDeleted: false }, { createdAt: 0, updatedAt: 0 })
    if (data.length > 0) {
      const taskList = data.map((i) => {
        i.title = i.title.charAt(0).toUpperCase() + i.title.slice(1)
        return i
      })
      res.status(200).json({ status: true, message: "Task List", data: taskList })
    }
    else {
      res.status(302).json({ status: false, message: "data not found" })
    }
  }
  catch (err) {
    res.status(500).json({ status: false, message: "Internal Server error" })
  }
})

router.get("/getUpcomingTask", async (req, res) => {
  try {
    const data = await task.find({ userId: req.user.userId, status: true, isDeleted: false }, { createdAt: 0, updatedAt: 0 })
    if (data.length > 0) {
      const taskList = data.map((i) => {
        i.title = i.title.charAt(0).toUpperCase() + i.title.slice(1)
        return i
      })
      res.status(200).json({ status: true, message: "Task List", data: taskList })
    }
    else {
      res.status(302).json({ status: false, message: "data not found" })
    }
  }
  catch (err) {
    res.status(500).json({ status: false, message: "Internal Server error" })
  }
})

router.get('/getSingleTask/:id', isValidObjectId, async (req, res) => {
  try {
    const data = await task.findOne({ _id: req.params.id, userId: req.user.userId, isDeleted: false }, { createdAt: 0, updatedAt: 0 })
    if (data != null) {
      data.title = data.title.charAt(0).toUpperCase() + data.title.slice(1)
      res.status(200).json({ status: true, message: "Task List", data })
    }
    else {
      res.status(302).json({ status: false, message: "data not found" })
    }
  }
  catch (err) {
    res.status(500).json({ status: false, message: "Internal server error" })
  }
})

router.put('/updateTask/:id', isValidObjectId, imageUpload.array("images"), async (req, res) => {
  try {
    const findTask = await task.findOne({ _id: req.params.id, userId: req.user.userId, isDeleted: false })
    if (findTask) {
      const taskList = await task.find({ _id: { $ne: req.params.id }, userId: req.user.userId })
      const existsTask = taskList.filter((i) => {
        return i.title === (req.body.title).toLowerCase().trim()
      })
      if (existsTask.length == 0) {
        if (req.files.length > 0) {
          const imageArray = []
          req.files.forEach((i) => {
            imageArray.push(`${process.env.API_URL}/uploads/${i.filename}`)
          })
          req.body.images = imageArray
        }
        else {
          req.body.images = []
        }
        req.body.title = req.body.title ? (req.body.title).toLowerCase().trim() : findTask.title
        const data = await task.findOneAndUpdate({ _id: req.params.id }, { $set: req.body }, { new: true })
        if (data != null) {
          res.status(200).json({ status: true, message: "Task update successfully!", data })
        }
        else {
          res.status(302).json({ status: false, message: "failed to update" })
        }
      }
      else {
        res.status(302).json({ status: false, message: "title name already exists" })
      }
    }
    else {
      res.status(302).json({ status: false, message: "data not found" })
    }
  }
  catch (err) {
    res.status(500).json({ status: false, message: "Internal server error" })
  }
})

router.delete('/deleteTask/:id', isValidObjectId, async (req, res) => {
  try {
    const data = await task.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { $set: { isDeleted: true } })
    if (data != null) {
      res.status(200).json({ status: true, message: "Task deleted", data })
    }
    else {
      res.status(302).json({ status: false, message: "failed to delete" })
    }
  }
  catch (err) {
    res.status(500).json({ status: false, message: "Internal server error" })
  }
})

router.post('/updateTaskStatus/:id', isValidObjectId, async (req, res) => {
  try {
    const findTask = await task.findOne({ _id: req.params.id, userId: req.user.userId, isDeleted: false })
    if (findTask != null) {
      const timeLine = findTask.timeLine
      timeLine.push({
        date: new Date().toISOString(),
        status: req.body.status
      })
      const data = await task.findOneAndUpdate({ _id: req.params.id }, { $set: { timeLine: timeLine } }, { new: true })
      res.status(200).json({ status: true, message: "Task update successfully!", data })
    }
    else {
      res.status(302).json({ status: false, message: "data not found" })
    }
  }
  catch (err) {
    res.status(500).json({ status: false, message: "Internal server error" })
  }
})

router.get("/getTaskByDate", async (req, res) => {
  try {
    console.log("req.user.userId", req.user.userId)
    const data = await task.aggregate([{ 
      $match: { 
        userId: new mongoose.Types.ObjectId(req.user.userId),
        month: req.body.month, isDeleted: false 
      } 
    },
    {
      $lookup: {
        from: "task_timings",
        foreignField: "_id",
        localField: "timing",
        as: "taskTiming"
      }
    }, {
      $unwind: "$taskTiming"
    }])
    console.log(data)
    console.log("req.body.month", req.body.month)
    const daysInMonth = await Array.from({ length: moment(new Date(req.body.month)).daysInMonth() }, (x, i) => moment(new Date(req.body.month)).startOf('month').add(i, 'days').format("YYYY-MM-DD"))
    // console.log("dates", dates)
    const timingList = await timing.find({ isDeleted: false })
    // console.log("timingList", timingList)
    var arr = []
    if (data.length > 0) {
      daysInMonth.forEach((i) => {
        data.forEach((j) => {
          var obj = {}
          if (i == moment(j.assignedDate).format("YYYY-MM-DD")) {
            const findTimeIndex = timingList.findIndex((i) => (i._id).toString() == (j.taskTiming._id).toString())
            const TimingName = timingList[findTimeIndex]
            if (findTimeIndex != -1) {
              // console.log("findTimeIndex", findTimeIndex)
              obj["date"] = i
              obj["task"] = j.title
              obj["description"] = j.description
              obj["timing"] = moment(TimingName.from_time).format("LT") + " - " + moment(TimingName.to_time).format("LT")
              arr.push(obj)
            }
          }
        }) 
      })
      res.status(200).json({ status: true, message: "Task List", data: arr })
    }
    else {
      res.status(302).json({ status: false, message: "data not found" })
    }
  }
  catch (err) {
    res.status(500).json({ status: false, message: "Internal Server Error" })
  }
})

const cronJobs = {};

router.post('/alarmSetup/:id', isValidObjectId, async (req, res) => {
  try {
    if (req.body.snoozeStatus) {
      const findTask = await task.findOne({ _id: req.params.id })
      const job = cron.schedule("*/1 * * * *", async () => {
        await sendMail(findTask.userEmail, "Day Planner - Task Notification(snooze)", `${findTask.title} is scheduled in this time`)
      });
      cronJobs[req.params.id] = job;
      res.status(200).json({ status: true, message: "The Task is snoozed for 1 minutes" })
    }
    else {
      if (cronJobs[req.params.id]) {
        // Destroy the cron job
        cronJobs[req.params.id].destroy();
        delete cronJobs[req.params.id];
      }
      res.status(302).json({ status: false, message: "task is not snoozed" })
    }
  }
  catch (err) {
    res.status(500).json({ status: false, message: "Internal server Error" })
  }
})

//  cron - Schedule Task
// syntax -> ******* -  second minutes hour day month week year

task.aggregate([{ $match: { status: true, isDeleted: false } }, {
  $lookup: {
    from: "task_timings",
    foreignField: "_id",
    localField: "timing",
    as: "taskTiming"
  }
}, {
  $unwind: "$taskTiming"
}
]).then((tasks) => {
  tasks.forEach((i) => {
    const time = i.taskTiming.from_time
    if (i.frequency == "Does not repeat") {
      const scheduledTime = `${new Date(time).getMinutes()} ${new Date(time).getHours()} ${new Date(i.assignedDate).getDate()} ${new Date(i.assignedDate).getMonth() + 1} ${new Date(i.assignedDate).getDay()}`
      const job = cron.schedule(scheduledTime, async () => {
        await sendMail(i.userEmail, "Day Planner - Task Notification", `${i.title} is scheduled in this time`)
        const updateTask = await task.findOneAndUpdate({ _id: i._id }, { $set: { status: false } }, { new: true })
        job.destroy()
      });
    }
    if (i.frequency == "Every day") {
      const scheduledTime = `${new Date(time).getMinutes()} ${new Date(time).getHours()} * * *`
      const job = cron.schedule(scheduledTime, async () => {
        await sendMail(i.userEmail, "Day Planner - Task Notification", `${i.title} is scheduled in this time`)
      });
    }
    if (i.frequency == "Every week") {
      const scheduledTime = `${new Date(time).getMinutes()} ${new Date(time).getHours()} * * ${new Date(i.assignedDate).getDay()} `
      const job = cron.schedule(scheduledTime, async () => {
        await sendMail(i.userEmail, "Day Planner - Task Notification", `${i.title} is scheduled in this time`)
      });
    }
    if (i.frequency == "Every month") {
      const scheduledTime = `${new Date(time).getMinutes()} ${new Date(time).getHours()} ${new Date(i.assignedDate).getDate()} * * `
      const job = cron.schedule(scheduledTime, async () => {
        await sendMail(i.userEmail, "Day Planner - Task Notification", `${i.title} is scheduled in this time`)
      });
    }
    if (i.frequency == "Every year") {
      const scheduledTime = `${new Date(time).getMinutes()} ${new Date(time).getHours()} ${new Date(i.assignedDate).getDate()} ${new Date(i.assignedDate).getMonth() + 1} *`
      const job = cron.schedule(scheduledTime, async () => {
        await sendMail(i.userEmail, "Day Planner - Task Notification", `${i.title} is scheduled in this time`)
      });
    }
  })
}).catch((err) => {
  console.log("err", err)
})

module.exports = router