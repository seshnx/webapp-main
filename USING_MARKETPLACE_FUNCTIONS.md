# Using Convex Marketplace Functions in React Components

Examples of how to use marketplace listings, transactions, ratings, and watchlist.

---

## 1. Marketplace Browse/Search

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function MarketplaceBrowse() {
  const [searchParams, setSearchParams] = useState({
    searchQuery: '',
    category: '',
    condition: '',
    minPrice: undefined,
    maxPrice: undefined,
    location: '',
    itemType: '',
  });

  const items = useQuery(api.marketplace.searchMarketItems, {
    ...searchParams,
    limit: 50,
  });

  const featuredItems = useQuery(api.marketplace.getFeaturedItems, { limit: 10 });

  return (
    <div className="marketplace-browse">
      {/* Search and Filters */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search for gear, instruments..."
          value={searchParams.searchQuery}
          onChange={(e) => setSearchParams({
            ...searchParams,
            searchQuery: e.target.value
          })}
        />

        <select
          value={searchParams.category}
          onChange={(e) => setSearchParams({
            ...searchParams,
            category: e.target.value
          })}
        >
          <option value="">All Categories</option>
          <option value="guitars">Guitars</option>
          <option value="keyboards">Keyboards</option>
          <option value="drums">Drums & Percussion</option>
          <option value="studio">Studio Equipment</option>
          <option value="live">Live Sound</option>
          <option value="accessories">Accessories</option>
        </select>

        <select
          value={searchParams.condition}
          onChange={(e) => setSearchParams({
            ...searchParams,
            condition: e.target.value
          })}
        >
          <option value="">Any Condition</option>
          <option value="new">New</option>
          <option value="like-new">Like New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
        </select>

        <div className="price-range">
          <input
            type="number"
            placeholder="Min Price"
            value={searchParams.minPrice || ''}
            onChange={(e) => setSearchParams({
              ...searchParams,
              minPrice: e.target.value ? Number(e.target.value) : undefined
            })}
          />
          <input
            type="number"
            placeholder="Max Price"
            value={searchParams.maxPrice || ''}
            onChange={(e) => setSearchParams({
              ...searchParams,
              maxPrice: e.target.value ? Number(e.target.value) : undefined
            })}
          />
        </div>

        <input
          type="text"
          placeholder="Location"
          value={searchParams.location}
          onChange={(e) => setSearchParams({
            ...searchParams,
            location: e.target.value
          })}
        />
      </div>

      {/* Featured Items */}
      {featuredItems && featuredItems.length > 0 && (
        <div className="featured-section">
          <h2>Featured Listings</h2>
          <div className="items-grid">
            {featuredItems.map((item) => (
              <MarketItemCard key={item._id} item={item} featured />
            ))}
          </div>
        </div>
      )}

      {/* All Items */}
      <div className="items-section">
        <h2>All Listings ({items?.length || 0})</h2>
        <div className="items-grid">
          {items?.map((item) => (
            <MarketItemCard key={item._id} item={item} />
          ))}
        </div>

        {items?.length === 0 && (
          <div className="empty-state">
            <p>No items found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MarketItemCard({ item, featured = false }: { item: any; featured?: boolean }) {
  const incrementView = useMutation(api.marketplace.incrementViewCount);
  const isInWatchlist = useQuery(api.marketplace.isInWatchlist, {
    userId: currentUserId, // Your current user ID
    itemId: item._id,
  });

  const handleView = () => {
    incrementView({ itemId: item._id });
    // Navigate to item details
  };

  const conditionColors = {
    new: 'green',
    'like-new': 'blue',
    good: 'yellow',
    fair: 'orange',
    poor: 'red',
  };

  return (
    <div
      className={`item-card ${featured ? 'featured' : ''}`}
      onClick={handleView}
    >
      {featured && <span className="featured-badge">⭐ Featured</span>}

      {item.photos && item.photos.length > 0 && (
        <img src={item.photos[0]} alt={item.title} className="item-image" />
      )}

      <div className="item-details">
        <h3>{item.title}</h3>

        <div className="item-meta">
          <span className={`condition-badge condition-${item.condition}`}>
            {item.condition}
          </span>
          <span className="category">{item.category}</span>
          {item.brand && <span className="brand">{item.brand}</span>}
        </div>

        {item.description && (
          <p className="description">
            {item.description.substring(0, 100)}...
          </p>
        )}

        <div className="item-footer">
          <span className="price">${item.price}</span>
          {item.negotiable && <span className="negotiable">OBO</span>}
          {item.location && <span className="location">{item.location}</span>}
        </div>

        <div className="item-stats">
          <span>👁 {item.viewCount || 0}</span>
          <span>❤️ {item.favoriteCount || 0}</span>
        </div>

        {isInWatchlist !== undefined && (
          <button
            className={`watchlist-btn ${isInWatchlist ? 'added' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              // Toggle watchlist
            }}
          >
            {isInWatchlist ? '❤️ Saved' : '🤍 Save'}
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 2. Create Listing Form

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function CreateListingForm({ userId, userName, userEmail }: {
  userId: string;
  userName: string;
  userEmail: string;
}) {
  const createItem = useMutation(api.marketplace.createMarketItem);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    itemType: 'gear',
    category: '',
    brand: '',
    model: '',
    year: '',
    condition: 'good',
    price: '',
    negotiable: false,
    location: '',
    photos: [] as string[],
    specifications: {},
    featured: false,
    shippingAvailable: false,
    shippingCost: '',
    localPickup: true,
    dimensions: '',
    weight: '',
    tags: [] as string[],
  });

  const handleSubmit = async () => {
    try {
      await createItem({
        sellerId: userId,
        sellerName: userName,
        sellerEmail: userEmail,
        title: formData.title,
        description: formData.description || undefined,
        itemType: formData.itemType,
        category: formData.category,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        year: formData.year ? Number(formData.year) : undefined,
        condition: formData.condition,
        price: Number(formData.price),
        negotiable: formData.negotiable,
        location: formData.location || undefined,
        photos: formData.photos.length > 0 ? formData.photos : undefined,
        specifications: Object.keys(formData.specifications).length > 0
          ? formData.specifications
          : undefined,
        featured: formData.featured,
        shippingAvailable: formData.shippingAvailable,
        shippingCost: formData.shippingCost ? Number(formData.shippingCost) : undefined,
        localPickup: formData.localPickup,
        dimensions: formData.dimensions || undefined,
        weight: formData.weight || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
      });

      alert('Listing created successfully!');
      // Reset form or navigate
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert('Failed to create listing. Please try again.');
    }
  };

  const handlePhotoUpload = async (files: FileList) => {
    // Upload to Vercel Blob or similar storage
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      // const url = await uploadToStorage(file);
      // uploadedUrls.push(url);
    }

    setFormData({
      ...formData,
      photos: [...formData.photos, ...uploadedUrls],
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="create-listing-form">
      <h2>Create New Listing</h2>

      {/* Basic Info */}
      <div className="form-section">
        <h3>Basic Information</h3>

        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Fender Stratocaster 2020"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your item..."
            rows={4}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Type *</label>
            <select
              value={formData.itemType}
              onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
            >
              <option value="gear">Gear</option>
              <option value="instrument">Instrument</option>
              <option value="equipment">Equipment</option>
              <option value="service">Service</option>
            </select>
          </div>

          <div className="form-group">
            <label>Category *</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., guitars, keyboards"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Brand</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="e.g., Fender"
            />
          </div>

          <div className="form-group">
            <label>Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g., Stratocaster"
            />
          </div>

          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="e.g., 2020"
            />
          </div>
        </div>
      </div>

      {/* Condition & Price */}
      <div className="form-section">
        <h3>Condition & Pricing</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Condition *</label>
            <select
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            >
              <option value="new">New</option>
              <option value="like-new">Like New</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>

          <div className="form-group">
            <label>Price ($) *</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.negotiable}
              onChange={(e) => setFormData({ ...formData, negotiable: e.target.checked })}
            />
            Price is negotiable (Or Best Offer)
          </label>
        </div>
      </div>

      {/* Photos */}
      <div className="form-section">
        <h3>Photos</h3>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => {
            if (e.target.files) {
              handlePhotoUpload(e.target.files);
            }
          }}
        />

        {formData.photos.length > 0 && (
          <div className="photos-preview">
            {formData.photos.map((url, index) => (
              <div key={index} className="photo-item">
                <img src={url} alt={`Upload ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      photos: formData.photos.filter((_, i) => i !== index),
                    });
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shipping */}
      <div className="form-section">
        <h3>Shipping & Pickup</h3>

        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="City, State"
          />
        </div>

        <div className="checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={formData.shippingAvailable}
              onChange={(e) => setFormData({ ...formData, shippingAvailable: e.target.checked })}
            />
            Shipping available
          </label>

          {formData.shippingAvailable && (
            <div className="form-group">
              <label>Shipping Cost ($)</label>
              <input
                type="number"
                value={formData.shippingCost}
                onChange={(e) => setFormData({ ...formData, shippingCost: e.target.value })}
                placeholder="0.00"
              />
            </div>
          )}

          <label>
            <input
              type="checkbox"
              checked={formData.localPickup}
              onChange={(e) => setFormData({ ...formData, localPickup: e.target.checked })}
            />
            Local pickup available
          </label>
        </div>

        {formData.localPickup && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label>Dimensions</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="e.g., 20x10x5 inches"
                />
              </div>

              <div className="form-group">
                <label>Weight</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="e.g., 15 lbs"
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Tags */}
      <div className="form-section">
        <h3>Tags</h3>
        <input
          type="text"
          placeholder="Enter tags separated by commas"
          onBlur={(e) => {
            const tags = e.target.value
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0);
            setFormData({ ...formData, tags });
          }}
        />
      </div>

      <button type="submit" className="btn-primary">
        Create Listing
      </button>
    </form>
  );
}
```

---

## 3. Transaction Management

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useState } from 'react';

function TransactionDashboard({ userId, userType }: {
  userId: string;
  userType: 'buyer' | 'seller';
}) {
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed' | 'all'>('pending');

  const transactions = useQuery(
    userType === 'buyer'
      ? api.marketplace.getTransactionsByBuyer
      : api.marketplace.getTransactionsBySeller,
    {
      userId,
      status: activeTab === 'all' ? undefined : activeTab,
    }
  );

  return (
    <div className="transaction-dashboard">
      <div className="header">
        <h1>{userType === 'buyer' ? 'My Purchases' : 'My Sales'}</h1>

        <div className="tabs">
          <button
            onClick={() => setActiveTab('pending')}
            className={activeTab === 'pending' ? 'active' : ''}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={activeTab === 'active' ? 'active' : ''}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={activeTab === 'completed' ? 'active' : ''}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={activeTab === 'all' ? 'active' : ''}
          >
            All
          </button>
        </div>
      </div>

      <div className="transactions-list">
        {transactions?.map((transaction) => (
          <TransactionCard
            key={transaction._id}
            transaction={transaction}
            userType={userType}
          />
        ))}

        {transactions?.length === 0 && (
          <p className="empty-state">No transactions found</p>
        )}
      </div>
    </div>
  );
}

function TransactionCard({ transaction, userType }: {
  transaction: any;
  userType: 'buyer' | 'seller';
}) {
  const item = useQuery(api.marketplace.getMarketItemById, {
    itemId: transaction.itemId,
  });

  const acceptOffer = useMutation(api.marketplace.acceptOffer);
  const rejectOffer = useMutation(api.marketplace.rejectOffer);
  const confirmPurchase = useMutation(api.marketplace.confirmPurchase);
  const completeTransaction = useMutation(api.marketplace.completeTransaction);
  const cancelTransaction = useMutation(api.marketplace.cancelTransaction);

  const [counterOffer, setCounterOffer] = useState('');
  const [review, setReview] = useState({
    rating: 5,
    text: '',
  });

  const handleAccept = async () => {
    try {
      await acceptOffer({
        transactionId: transaction._id,
        counterOffer: counterOffer ? Number(counterOffer) : undefined,
      });
      alert('Offer accepted!');
    } catch (error) {
      alert('Failed to accept offer');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Reason for rejection (optional):');
    try {
      await rejectOffer({
        transactionId: transaction._id,
        reason: reason || undefined,
      });
      alert('Offer rejected');
    } catch (error) {
      alert('Failed to reject offer');
    }
  };

  const handleConfirm = async () => {
    const tracking = prompt('Enter tracking number (if shipped):');
    try {
      await confirmPurchase({
        transactionId: transaction._id,
        paymentConfirmed: true,
        trackingNumber: tracking || undefined,
      });
      alert('Purchase confirmed!');
    } catch (error) {
      alert('Failed to confirm purchase');
    }
  };

  const handleComplete = async () => {
    if (!review.text) {
      alert('Please leave a review');
      return;
    }

    try {
      await completeTransaction({
        transactionId: transaction._id,
        [userType === 'buyer' ? 'sellerRating' : 'buyerRating']: review.rating,
        [userType === 'buyer' ? 'sellerReview' : 'buyerReview']: review.text,
      });
      alert('Transaction completed!');
    } catch (error) {
      alert('Failed to complete transaction');
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Reason for cancellation:');
    if (!reason) return;

    try {
      await cancelTransaction({
        transactionId: transaction._id,
        cancelledBy: userType,
        reason,
      });
      alert('Transaction cancelled');
    } catch (error) {
      alert('Failed to cancel transaction');
    }
  };

  const statusConfig = {
    pending: { label: 'Pending', color: 'yellow' },
    accepted: { label: 'Accepted', color: 'blue' },
    countered: { label: 'Countered', color: 'purple' },
    rejected: { label: 'Rejected', color: 'red' },
    confirmed: { label: 'Confirmed', color: 'green' },
    completed: { label: 'Completed', color: 'gray' },
    cancelled: { label: 'Cancelled', color: 'red' },
  };

  const status = statusConfig[transaction.status as keyof typeof statusConfig];

  return (
    <div className={`transaction-card status-${transaction.status}`}>
      {/* Item Info */}
      {item && (
        <div className="item-info">
          {item.photos && item.photos.length > 0 && (
            <img src={item.photos[0]} alt={item.title} className="item-thumb" />
          )}
          <div>
            <h3>{item.title}</h3>
            <p>Listed price: ${item.price}</p>
          </div>
        </div>
      )}

      {/* Transaction Details */}
      <div className="transaction-details">
        <div className="status-badge" style={{ backgroundColor: status.color }}>
          {status.label}
        </div>

        {transaction.offerAmount && transaction.offerAmount !== item?.price && (
          <p><strong>Offer:</strong> ${transaction.offerAmount}</p>
        )}

        {transaction.message && (
          <p><strong>Message:</strong> {transaction.message}</p>
        )}

        {transaction.counterOffer && (
          <p><strong>Counter offer:</strong> ${transaction.counterOffer}</p>
        )}

        {transaction.trackingNumber && (
          <p><strong>Tracking:</strong> {transaction.trackingNumber}</p>
        )}

        <p><strong>Created:</strong> {new Date(transaction.createdAt).toLocaleString()}</p>
      </div>

      {/* Actions based on status and user type */}
      {userType === 'seller' && transaction.status === 'pending' && (
        <div className="actions">
          <input
            type="number"
            placeholder="Counter offer (optional)"
            value={counterOffer}
            onChange={(e) => setCounterOffer(e.target.value)}
          />
          <button onClick={handleAccept}>Accept</button>
          <button onClick={handleReject} className="btn-secondary">
            Reject
          </button>
        </div>
      )}

      {userType === 'buyer' && transaction.status === 'accepted' && (
        <div className="actions">
          <button onClick={handleConfirm}>Confirm Purchase</button>
          <button onClick={handleCancel} className="btn-danger">
            Cancel
          </button>
        </div>
      )}

      {userType === 'buyer' && transaction.status === 'countered' && (
        <div className="actions">
          <p>Counter offer: ${transaction.counterOffer}</p>
          <button onClick={handleAccept}>Accept Counter</button>
          <button onClick={handleReject} className="btn-secondary">
            Decline
          </button>
        </div>
      )}

      {transaction.status === 'confirmed' && (
        <div className="actions">
          <div className="review-form">
            <h4>Leave a Review</h4>
            <div className="rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReview({ ...review, rating: star })}
                  className={review.rating >= star ? 'filled' : ''}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              placeholder="Share your experience..."
              value={review.text}
              onChange={(e) => setReview({ ...review, text: e.target.value })}
            />
            <button onClick={handleComplete}>Complete & Review</button>
          </div>
        </div>
      )}

      {/* Cancel for pending/active transactions */}
      {['pending', 'accepted', 'countered'].includes(transaction.status) && (
        <button onClick={handleCancel} className="btn-danger">
          Cancel Transaction
        </button>
      )}

      {/* Reviews for completed */}
      {transaction.status === 'completed' && (
        <div className="reviews">
          {transaction.buyerReview && (
            <div className="review">
              <strong>Buyer's Review:</strong>
              <p>Rating: {transaction.buyerRating}/5 ★</p>
              <p>{transaction.buyerReview}</p>
            </div>
          )}
          {transaction.sellerReview && (
            <div className="review">
              <strong>Seller's Review:</strong>
              <p>Rating: {transaction.sellerRating}/5 ★</p>
              <p>{transaction.sellerReview}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 4. Seller Profile & Ratings

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

function SellerProfile({ sellerId }: { sellerId: string }) {
  const seller = useQuery(api.users.getUserByClerkId, { clerkId: sellerId });
  const items = useQuery(api.marketplace.getMarketItemsBySeller, {
    sellerId,
    status: 'available',
  });
  const rating = useQuery(api.marketplace.getSellerRating, { sellerId });
  const reviews = useQuery(api.marketplace.getSellerReviews, {
    sellerId,
    limit: 10,
  });

  if (seller === undefined) return <div>Loading...</div>;
  if (seller === null) return <div>Seller not found</div>;

  return (
    <div className="seller-profile">
      {/* Header */}
      <div className="profile-header">
        <img src={seller.avatarUrl || '/avatar.png'} alt={seller.displayName} />
        <div>
          <h1>{seller.displayName}</h1>
          {seller.bio && <p>{seller.bio}</p>}
          {seller.location && <p>📍 {seller.location}</p>}
        </div>
      </div>

      {/* Rating */}
      {rating && (
        <div className="rating-section">
          <div className="overall-rating">
            <span className="stars">
              {'★'.repeat(Math.floor(rating.averageRating))}
              {'☆'.repeat(5 - Math.floor(rating.averageRating))}
            </span>
            <span className="score">{rating.averageRating}/5</span>
            <span className="count">({rating.totalReviews} reviews)</span>
          </div>

          <div className="rating-breakdown">
            {Object.entries(rating.ratingBreakdown)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([stars, count]) => (
                <div key={stars} className="rating-bar">
                  <span>{stars} ★</span>
                  <div className="bar">
                    <div
                      className="fill"
                      style={{
                        width: `${rating.totalReviews > 0 ? (count / rating.totalReviews) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span>{count}</span>
                </div>
              ))}
          </div>

          <div className="stats">
            <span>{rating.totalSales} sales</span>
            <span>{items?.length || 0} active listings</span>
          </div>
        </div>
      )}

      {/* Active Listings */}
      <div className="listings-section">
        <h2>Active Listings ({items?.length || 0})</h2>
        <div className="items-grid">
          {items?.map((item) => (
            <MarketItemCard key={item._id} item={item} />
          ))}
        </div>
      </div>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="reviews-section">
          <h2>Recent Reviews</h2>
          <div className="reviews-list">
            {reviews.map((review: any) => (
              <div key={review._id} className="review-card">
                <div className="review-header">
                  <span className="stars">
                    {'★'.repeat(review.sellerRating || 0)}
                    {'☆'.repeat(5 - (review.sellerRating || 0))}
                  </span>
                  <span className="date">
                    {new Date(review.completedAt || 0).toLocaleDateString()}
                  </span>
                </div>
                <p className="review-text">{review.sellerReview}</p>
                <p className="buyer-name">From: {review.buyerName}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 5. My Watchlist

```typescript
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function MyWatchlist({ userId }: { userId: string }) {
  const watchlist = useQuery(api.marketplace.getWatchlist, { userId });
  const removeFromWatchlist = useMutation(api.marketplace.removeFromWatchlist);

  const handleRemove = async (itemId: any) => {
    try {
      await removeFromWatchlist({ userId, itemId });
    } catch (error) {
      alert('Failed to remove from watchlist');
    }
  };

  // Get full item details for each watchlist entry
  const items = watchlist?.map((entry) => entry.itemId).filter(Boolean);

  return (
    <div className="watchlist-page">
      <h1>My Watchlist</h1>

      <div className="items-grid">
        {items?.length === 0 ? (
          <p>No saved items yet</p>
        ) : (
          items.map((itemId) => (
            <WatchlistItem
              key={itemId}
              itemId={itemId}
              onRemove={() => handleRemove(itemId)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function WatchlistItem({ itemId, onRemove }: {
  itemId: any;
  onRemove: () => void;
}) {
  const item = useQuery(api.marketplace.getMarketItemById, { itemId });

  if (!item) return null;

  return (
    <div className="watchlist-item">
      <MarketItemCard item={item} />
      <button onClick={onRemove} className="remove-btn">
        Remove from Watchlist
      </button>
    </div>
  );
}
```

---

## Common Patterns

### Check Item Availability Before Purchase
```typescript
const item = useQuery(api.marketplace.getMarketItemById, { itemId });

const handlePurchase = () => {
  if (!item) {
    alert('Item not found');
    return;
  }

  if (item.status !== 'available') {
    alert('This item is not available');
    return;
  }

  if (item.sellerId === currentUserId) {
    alert('Cannot purchase your own item');
    return;
  }

  // Proceed with purchase
};
```

### Format Currency
```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};
```

### Calculate Rating Percentage
```typescript
const getRatingPercentage = (rating: number, total: number) => {
  return total > 0 ? Math.round((rating / total) * 100) : 0;
};
```

---

## Next Steps

1. ✅ Marketplace functions created
2. ⏳ Use in your components
3. ⏳ Add image upload functionality
4. ⏳ Add payment integration (Stripe)
5. ⏳ Add shipping integration
6. ⏳ Add real-time notifications for offers

All your marketplace features are ready to go! 🛒
