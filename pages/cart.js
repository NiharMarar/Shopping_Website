import Head from 'next/head';
import { useCart } from '../lib/CartContext';
import CheckoutButton from '../components/CheckoutButton';

export default function Cart() {
  const { cartItems, removeFromCart } = useCart();

  const subtotal = cartItems.reduce(
    (total, item) => total + (item.product.product_price * item.quantity),
    0
  );

  return (
    <>
      <Head>
        <title>Shopping Cart - Your Shop</title>
        <meta name="description" content="Your shopping cart" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-4 text-gray-500">Add some items to your cart to see them here.</p>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
            <div className="lg:col-span-7">
              <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.product.product_id} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product.image_url}
                        alt={item.product.product_name}
                        className="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32"
                      />
                    </div>

                    <div className="ml-4 flex-1 flex flex-col sm:ml-6">
                      <div>
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{item.product.product_name}</h4>
                          <p className="ml-4 text-sm font-medium text-gray-900">${item.product.product_price}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex-1 flex items-end justify-between">
                        <div className="flex items-center">
                          <span className="mr-4 text-sm text-gray-600">Qty: {item.quantity}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.product_id)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Order summary */}
            <div className="mt-10 lg:mt-0 lg:col-span-5">
              <div className="bg-gray-50 rounded-lg px-4 py-6 sm:p-6 lg:p-8">
                <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Subtotal</div>
                    <div className="text-sm font-medium text-gray-900">${subtotal.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <div className="text-base font-medium text-gray-900">Order total</div>
                    <div className="text-base font-medium text-gray-900">${subtotal.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <CheckoutButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
} 