import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useCart } from '../../lib/CartContext';
import { supabase } from '../../lib/supabaseClient';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart, showToast } = useCart();

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [user, setUser] = useState(null);
  const [verifiedUserIds, setVerifiedUserIds] = useState([]);
  const [reviewSort, setReviewSort] = useState('newest');

  useEffect(() => {
    if (id) {
      fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          setProduct(data);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching product:', error);
          setIsLoading(false);
        });
      fetchReviews(reviewSort);
      getUser();
      fetchVerifiedPurchasers();
    }
    // eslint-disable-next-line
  }, [id, reviewSort]);

  const fetchReviews = async (sort = reviewSort) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/reviews?product=${id}&sort=${sort}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      setReviews([]);
    }
  };

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  // Fetch user_ids who have purchased this product
  const fetchVerifiedPurchasers = async () => {
    if (!id) return;
    // Query order_items + orders to get user_ids who bought this product
    const { data, error } = await supabase
      .from('order_items')
      .select('order_id, product_id, orders(user_id)') // Correct join syntax
      .eq('product_id', id);
    if (!error && Array.isArray(data)) {
      const userIds = data.map(item => item.orders?.user_id).filter(Boolean);
      setVerifiedUserIds([...new Set(userIds)]);
    } else {
      setVerifiedUserIds([]);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    showToast('Added to cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setReviewError('You must be logged in to leave a review.');
        setReviewSubmitting(false);
        return;
      }
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: id,
          rating: reviewRating,
          review_text: reviewText,
          user_id: user.id
        })
      });
      if (!res.ok) {
        const err = await res.json();
        setReviewError(err.error || 'Failed to submit review.');
      } else {
        setReviewText('');
        setReviewRating(5);
        fetchReviews();
        fetchVerifiedPurchasers();
      }
    } catch (err) {
      setReviewError('Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/reviews?review_id=${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        fetchReviews();
        fetchVerifiedPurchasers();
      }
    } catch (err) {
      // Optionally show error
    }
  };

  // Calculate average rating
  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <>
        <div className="flex justify-center items-center h-64 bg-cyberpunk-bg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyberpunk-neonBlue"></div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <div className="text-center py-12 bg-cyberpunk-bg min-h-screen">
          <h1 className="text-2xl font-nexus font-bold text-cyberpunk-neonPink">Product not found</h1>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-cyberpunk-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-cyberpunk-surface rounded-xl shadow-neon p-8 border border-cyberpunk-neonBlue mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product image */}
          <div className="flex flex-col items-center justify-center">
            <img
              src={product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
              alt={product.product_name}
              className="w-full max-w-xs rounded-lg border-2 border-cyberpunk-neonBlue shadow-neon mb-4 bg-cyberpunk-bg object-cover"
            />
          </div>
          {/* Product details */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-nexus font-bold text-cyberpunk-neonBlue mb-4 drop-shadow-[0_0_8px_#00ffe7]">{product.product_name}</h1>
            <p className="text-cyberpunk-neonPurple mb-4">{product.product_description}</p>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-nexus font-extrabold text-cyberpunk-neonPink drop-shadow-[0_0_8px_#ff00cb]">${product.product_price}</span>
              <label htmlFor="quantity" className="mr-2 text-cyberpunk-neonBlue font-nexus font-bold">Qty:</label>
              <select
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="rounded-md border-cyberpunk-neonBlue py-1.5 px-3 bg-cyberpunk-bg text-cyberpunk-neonBlue font-nexus font-bold shadow-neon focus:border-cyberpunk-neonPink focus:ring-cyberpunk-neonPink transition-colors"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <button
                onClick={handleAddToCart}
                className="px-6 py-2 bg-cyberpunk-neonBlue text-cyberpunk-bg rounded font-nexus font-bold hover:bg-cyberpunk-neonPink hover:text-cyberpunk-bg shadow-neon border border-cyberpunk-neonPink transition-colors"
              >
                Add to Cart
              </button>
            </div>
            {/* Average rating */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-cyberpunk-neonPink font-bold">{avgRating ? `${avgRating} / 5` : 'No ratings yet'}</span>
              {avgRating && (
                <span className="text-yellow-400">{'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}</span>
              )}
              <span className="text-cyberpunk-neonPurple text-sm ml-2">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          </div>
        </div>
      </div>
      {/* Reviews Section */}
      <div className="max-w-4xl mx-auto bg-cyberpunk-surface rounded-xl shadow-neon p-8 border border-cyberpunk-neonBlue">
        <h2 className="text-2xl font-nexus font-bold text-cyberpunk-neonBlue mb-6">Reviews</h2>
        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="reviewSort" className="text-cyberpunk-neonPurple font-nexus font-bold">Sort by:</label>
          <select
            id="reviewSort"
            value={reviewSort}
            onChange={e => setReviewSort(e.target.value)}
            className="rounded-md border-cyberpunk-neonBlue py-1 px-3 bg-cyberpunk-bg text-cyberpunk-neonBlue font-nexus font-bold shadow-neon focus:border-cyberpunk-neonPink focus:ring-cyberpunk-neonPink transition-colors"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
        {reviews.length === 0 ? (
          <div className="text-cyberpunk-neonPurple mb-8">No reviews yet. Be the first to review this product!</div>
        ) : (
          <div className="space-y-6 mb-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-cyberpunk-bg rounded-lg p-4 border border-cyberpunk-neonBlue shadow-neon flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-yellow-400">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <span className="text-cyberpunk-neonPurple text-xs ml-2">{new Date(review.created_at).toLocaleDateString()}</span>
                    {verifiedUserIds.includes(review.user_id) && (
                      <span className="ml-2 px-2 py-0.5 bg-green-700 text-green-300 text-xs rounded font-bold border border-green-400 shadow-neon">Verified Purchase</span>
                    )}
                  </div>
                  <div className="text-cyberpunk-neonBlue font-nexus font-bold mb-1">
                  User: {review.user?.full_name || review.user?.username || `User${review.user_id.slice(-4)}`}
                  </div>
                  <div className="text-cyberpunk-neonPurple">{review.review_text}</div>
                </div>
                {user && review.user_id === user.id && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="mt-2 md:mt-0 px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-neon border border-red-400 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {/* Review Form */}
        {user ? (
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-nexus font-bold text-cyberpunk-neonBlue mb-2">Your Rating</label>
              <select
                value={reviewRating}
                onChange={e => setReviewRating(Number(e.target.value))}
                className="w-32 px-4 py-2 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
                required
              >
                {[5,4,3,2,1].map(num => (
                  <option key={num} value={num}>{'★'.repeat(num)}{'☆'.repeat(5-num)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-nexus font-bold text-cyberpunk-neonBlue mb-2">Your Review</label>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                className="w-full px-4 py-3 bg-cyberpunk-bg border border-cyberpunk-neonBlue rounded-lg text-cyberpunk-neonBlue placeholder-cyberpunk-neonPurple font-nexus focus:outline-none focus:ring-2 focus:ring-cyberpunk-neonPink"
                placeholder="Write your review..."
                rows={3}
                required
              />
            </div>
            {reviewError && <div className="text-red-400 font-bold">{reviewError}</div>}
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-nexus font-bold rounded-lg transition-all duration-300 shadow-neon-pink disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="text-cyberpunk-neonPurple">Log in to leave a review.</div>
        )}
      </div>
    </div>
  );
} 