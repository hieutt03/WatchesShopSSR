const { Watch } = require("lucide");
const { Comment } = require("../model");
const commentServices = require("../services/commentServices");
const watchService = require("../services/watchService");
const watchController = require("./watchController");

class CommentController {
    async getCommentsByAuthor(req, res) {
        try {
            const { author } = req.body
            const comments = await commentServices.getAllCommentByAuthor(author)
            return res.render("layout", {
                body: "profile/comment",
                comments
            })
        } catch (error) {
            console.error("Error fetching comments:", error);
            return res.status(500).render("error");
        }
    }

    async getAllComments(req, res) {
        try {
            const comments = await commentServices.getAll()
            return res.render("layout", {
                body: "",
                comments
            })
        } catch (error) {
            console.error("Error fetching comments:", error);
            return res.status(500).render("error");
        }
    }

    async createComment(req, res) {
        try {
            const { watchId } = req.params;
            const { content, rating } = req.body;
            const author = req.user._id;

            console.log(watchId, content, rating, author);
            const comment = new Comment({ content, rating, author })

            const watch = await watchService.getWatchById(watchId);
            if (!watch) {
                req.session.message = { type: "danger", message: "Not found watch!" }
                return res.redirect(`/watch/${watchId}`)
            }
            watch.comments.push(comment);
            await watch.save();

            await commentServices.createComment(comment);
            req.session.message = { type: "success", message: "You already have commented!" }
            return res.status(201).redirect(`/watch/${watchId}`);
        } catch (error) {
            console.error("Error create comments:", error);
            return res.status(500).render("error");
        }
    }
 
}

module.exports = new CommentController