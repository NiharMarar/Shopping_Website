let cart = [];

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { productId } = req.body;
    cart.push(productId);
    return res.status(200).json({ cart });
  }
  res.status(200).json({ cart });
}
