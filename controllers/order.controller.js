/**
 * @file order.controller.js
 * @description Controller for Order CRUD operations
 */

var db = require('../models');
var Order = db.order;
var OrderDetail = db.orderDetail;
var Product = db.product;

// Generate unique order number
var generateOrderNumber = function () {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

module.exports = {
    createOrder: async function (req, res) {
        try {
            var items = req.body.items;
            var shippingAddress = req.body.shippingAddress;
            var phoneNumber = req.body.phoneNumber;
            var notes = req.body.notes;

            if (!items || items.length === 0) {
                return res.status(400).json({ message: 'Đơn hàng phải có ít nhất 1 sản phẩm' });
            }

            if (!shippingAddress || !phoneNumber) {
                return res.status(400).json({ message: 'Địa chỉ giao hàng và số điện thoại là bắt buộc' });
            }

            var totalPrice = 0;
            var orderDetails = [];

            // Create order detail items and calculate total
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var product = await Product.findById(item.productId);
                
                if (!product) {
                    return res.status(404).json({ message: `Sản phẩm ${item.productId} không tìm thấy` });
                }

                if (product.stock < item.quantity) {
                    return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ số lượng` });
                }

                var price = product.price * (1 - product.discount / 100);
                var itemTotal = price * item.quantity;
                totalPrice += itemTotal;

                var orderDetail = new OrderDetail({
                    product: item.productId,
                    quantity: item.quantity,
                    price: price,
                    totalPrice: itemTotal
                });

                await orderDetail.save();
                orderDetails.push(orderDetail._id);

                // Update product stock
                product.stock -= item.quantity;
                await product.save();
            }

            var order = new Order({
                orderNumber: generateOrderNumber(),
                user: req.user.id,
                items: orderDetails,
                totalPrice: totalPrice,
                shippingAddress: shippingAddress,
                phoneNumber: phoneNumber,
                notes: notes
            });

            await order.save();
            await order.populate('user', 'name email');
            await order.populate('items');

            res.status(201).json({
                message: 'Đặt hàng thành công',
                data: order
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getAllOrders: async function (req, res) {
        try {
            var orders = await Order.find()
                .populate('user', 'name email')
                .populate('items')
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: 'Lấy danh sách đơn hàng thành công',
                data: orders
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getUserOrders: async function (req, res) {
        try {
            var orders = await Order.find({ user: req.user.id })
                .populate('user', 'name email')
                .populate('items')
                .sort({ createdAt: -1 });

            res.status(200).json({
                message: 'Lấy đơn hàng của người dùng thành công',
                data: orders
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getOrderById: async function (req, res) {
        try {
            var order = await Order.findById(req.params.id)
                .populate('user', 'name email')
                .populate({
                    path: 'items',
                    populate: {
                        path: 'product',
                        select: 'name price discount'
                    }
                });

            if (!order) {
                return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
            }

            res.status(200).json({
                message: 'Lấy đơn hàng thành công',
                data: order
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    updateOrderStatus: async function (req, res) {
        try {
            var status = req.body.status;

            var validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
            }

            var order = await Order.findByIdAndUpdate(
                req.params.id,
                { status: status },
                { new: true }
            ).populate('user', 'name email')
                .populate('items');

            if (!order) {
                return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
            }

            res.status(200).json({
                message: 'Cập nhật trạng thái đơn hàng thành công',
                data: order
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    cancelOrder: async function (req, res) {
        try {
            var order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({ message: 'Đơn hàng không tìm thấy' });
            }

            if (order.status !== 'pending' && order.status !== 'confirmed') {
                return res.status(400).json({ message: 'Không thể hủy đơn hàng ở trạng thái này' });
            }

            // Restore product stock
            for (var j = 0; j < order.items.length; j++) {
                var itemId = order.items[j];
                var orderDetail = await OrderDetail.findById(itemId);
                var product = await Product.findById(orderDetail.product);
                product.stock += orderDetail.quantity;
                await product.save();
            }

            order.status = 'cancelled';
            await order.save();

            res.status(200).json({
                message: 'Hủy đơn hàng thành công',
                data: order
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
